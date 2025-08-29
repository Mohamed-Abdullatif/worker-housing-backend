const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');

class NotificationService {
    constructor() {
        // Initialize Firebase Admin if credentials are available
        if (
            process.env.FIREBASE_PROJECT_ID &&
            process.env.FIREBASE_PRIVATE_KEY &&
            process.env.FIREBASE_CLIENT_EMAIL
        ) {
            try {
                if (!admin.apps.length) {
                    admin.initializeApp({
                        credential: admin.credential.cert({
                            projectId: process.env.FIREBASE_PROJECT_ID,
                            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                        }),
                    });
                }
                this.firebaseEnabled = true;
            } catch (error) {
                console.error('Firebase initialization error:', error);
                this.firebaseEnabled = false;
            }
        } else {
            console.warn('Firebase credentials not found. Push notifications will be disabled.');
            this.firebaseEnabled = false;
        }

        // Initialize Nodemailer if credentials are available
        if (
            process.env.SMTP_HOST &&
            process.env.SMTP_PORT &&
            process.env.SMTP_USER &&
            process.env.SMTP_PASS
        ) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            this.emailEnabled = true;
        } else {
            console.warn('SMTP credentials not found. Email notifications will be disabled.');
            this.emailEnabled = false;
        }
    }

    // Send push notification
    async sendPushNotification(user, title, body, data = {}) {
        try {
            if (!this.firebaseEnabled) {
                console.warn('Push notification skipped: Firebase is not configured');
                return false;
            }

            if (!user.pushToken) {
                console.warn('Push notification skipped: User does not have a push token');
                return false;
            }

            const message = {
                notification: {
                    title,
                    body,
                },
                data: {
                    ...data,
                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                },
                token: user.pushToken,
            };

            await admin.messaging().send(message);
            return true;
        } catch (error) {
            console.error('Push notification error:', error);
            return false;
        }
    }

    // Send email notification
    async sendEmailNotification(user, subject, html) {
        try {
            if (!this.emailEnabled) {
                console.warn('Email notification skipped: SMTP is not configured');
                return false;
            }

            if (!user.email) {
                console.warn('Email notification skipped: User does not have an email');
                return false;
            }

            await this.transporter.sendMail({
                from: process.env.SMTP_USER,
                to: user.email,
                subject,
                html,
            });
            return true;
        } catch (error) {
            console.error('Email notification error:', error);
            return false;
        }
    }

    // Create and send notification
    async sendNotification({
        userId,
        title,
        titleAr,
        body,
        bodyAr,
        type,
        data = {},
        sendEmail = true,
        sendPush = true,
    }) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Create notification record
            const notification = new Notification({
                user: userId,
                title,
                titleAr,
                body,
                bodyAr,
                type,
                data,
            });

            // Send push notification if requested
            if (sendPush) {
                const pushSent = await this.sendPushNotification(user, title, body, data);
                notification.sentViaPush = pushSent;
            }

            // Send email notification if requested and user has email
            if (sendEmail && user.email) {
                const emailSent = await this.sendEmailNotification(
                    user,
                    title,
                    `<h1>${title}</h1><p>${body}</p>`
                );
                notification.sentViaEmail = emailSent;
            }

            await notification.save();
            return notification;
        } catch (error) {
            console.error('Send notification error:', error);
            throw error;
        }
    }

    // Send maintenance notification
    async sendMaintenanceNotification(maintenanceRequest) {
        const { user, type, status, roomNumber } = maintenanceRequest;

        const notifications = {
            created: {
                title: 'New Maintenance Request',
                titleAr: 'طلب صيانة جديد',
                body: `New ${type} maintenance request for room ${roomNumber}`,
                bodyAr: `طلب صيانة جديد ${type} للغرفة ${roomNumber}`,
            },
            processing: {
                title: 'Maintenance Request Update',
                titleAr: 'تحديث طلب الصيانة',
                body: `Your ${type} maintenance request is being processed`,
                bodyAr: `جاري العمل على طلب الصيانة ${type}`,
            },
            completed: {
                title: 'Maintenance Request Completed',
                titleAr: 'اكتمال طلب الصيانة',
                body: `Your ${type} maintenance request has been completed`,
                bodyAr: `تم اكتمال طلب الصيانة ${type}`,
            },
            cancelled: {
                title: 'Maintenance Request Cancelled',
                titleAr: 'إلغاء طلب الصيانة',
                body: `Your ${type} maintenance request has been cancelled`,
                bodyAr: `تم إلغاء طلب الصيانة ${type}`,
            },
        };

        const notification = notifications[status];
        if (notification) {
            await this.sendNotification({
                userId: user,
                ...notification,
                type: 'maintenance',
                data: { maintenanceId: maintenanceRequest._id },
            });
        }
    }

    // Send invoice notification
    async sendInvoiceNotification(invoice) {
        const { user, invoiceNumber, amount, status } = invoice;

        const notifications = {
            created: {
                title: 'New Invoice',
                titleAr: 'فاتورة جديدة',
                body: `New invoice #${invoiceNumber} for SAR ${amount}`,
                bodyAr: `فاتورة جديدة رقم ${invoiceNumber} بقيمة ${amount} ريال`,
            },
            paid: {
                title: 'Invoice Paid',
                titleAr: 'تم دفع الفاتورة',
                body: `Invoice #${invoiceNumber} has been paid`,
                bodyAr: `تم دفع الفاتورة رقم ${invoiceNumber}`,
            },
            overdue: {
                title: 'Invoice Overdue',
                titleAr: 'فاتورة متأخرة',
                body: `Invoice #${invoiceNumber} is overdue`,
                bodyAr: `الفاتورة رقم ${invoiceNumber} متأخرة`,
            },
        };

        const notification = notifications[status];
        if (notification) {
            await this.sendNotification({
                userId: user,
                ...notification,
                type: 'invoice',
                data: { invoiceId: invoice._id },
            });
        }
    }

    // Send grocery order notification
    async sendGroceryOrderNotification(order) {
        const { user, orderNumber, status } = order;

        const notifications = {
            created: {
                title: 'New Grocery Order',
                titleAr: 'طلب بقالة جديد',
                body: `Your order #${orderNumber} has been received`,
                bodyAr: `تم استلام طلبك رقم ${orderNumber}`,
            },
            processing: {
                title: 'Order Processing',
                titleAr: 'جاري تجهيز الطلب',
                body: `Your order #${orderNumber} is being prepared`,
                bodyAr: `جاري تجهيز طلبك رقم ${orderNumber}`,
            },
            ready: {
                title: 'Order Ready',
                titleAr: 'الطلب جاهز',
                body: `Your order #${orderNumber} is ready for pickup`,
                bodyAr: `طلبك رقم ${orderNumber} جاهز للاستلام`,
            },
            delivered: {
                title: 'Order Delivered',
                titleAr: 'تم توصيل الطلب',
                body: `Your order #${orderNumber} has been delivered`,
                bodyAr: `تم توصيل طلبك رقم ${orderNumber}`,
            },
            cancelled: {
                title: 'Order Cancelled',
                titleAr: 'تم إلغاء الطلب',
                body: `Your order #${orderNumber} has been cancelled`,
                bodyAr: `تم إلغاء طلبك رقم ${orderNumber}`,
            },
        };

        const notification = notifications[status];
        if (notification) {
            await this.sendNotification({
                userId: user,
                ...notification,
                type: 'grocery',
                data: { orderId: order._id },
            });
        }
    }

    // Get user notifications
    async getUserNotifications(userId, { page = 1, limit = 20, type, isRead }) {
        try {
            const query = { user: userId };

            if (type) query.type = type;
            if (typeof isRead === 'boolean') query.isRead = isRead;

            const total = await Notification.countDocuments(query);
            const notifications = await Notification.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            return {
                notifications,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            console.error('Get user notifications error:', error);
            throw error;
        }
    }

    // Mark notification as read
    async markAsRead(notificationId, userId) {
        try {
            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, user: userId },
                { isRead: true, readAt: new Date() },
                { new: true }
            );

            return notification;
        } catch (error) {
            console.error('Mark notification as read error:', error);
            throw error;
        }
    }

    // Mark all notifications as read
    async markAllAsRead(userId) {
        try {
            await Notification.updateMany(
                { user: userId, isRead: false },
                { isRead: true, readAt: new Date() }
            );

            return true;
        } catch (error) {
            console.error('Mark all notifications as read error:', error);
            throw error;
        }
    }
}

module.exports = new NotificationService();