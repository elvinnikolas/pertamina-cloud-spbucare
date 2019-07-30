import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as express from 'express'
import * as bodyParser from 'body-parser'
// import { FieldValue } from '@google-cloud/firestore'

admin.initializeApp(functions.config().firebase)
// const auth = admin.auth()
const db = admin.firestore()

const app = express()
const main = express()
main.use('/api/v1', app)
main.use(bodyParser.json())

export const webApi = functions.https.onRequest(main)

exports.onCreateOrder = functions.firestore
    .document('users/{userId}/orders/{orderId}')
    .onCreate(async (snapshot, context) => {
        try {
            const userId = context.params.userId
            const orderId = context.params.orderId

            const user = await db.collection('users').doc(userId).get()
            const order = await db.collection('users/' + userId + '/orders').doc(orderId).get()

            const dataUser = user.data()
            let name, salesRetailId, registrationTokenUser
            if (dataUser !== undefined) {
                name = dataUser.name
                salesRetailId = dataUser.salesRetailId
                registrationTokenUser = dataUser.token
            }

            const dataOrder = order.data()
            let type, stringVolume
            let biosolar, dexlite, pertadex, pertalite, pertamax, premium, pxturbo
            if (dataOrder !== undefined) {
                if (dataOrder.orderVolume.biosolar !== 0) {
                    biosolar = "biosolar " + String(dataOrder.orderVolume.biosolar) + " kl, "
                } else { biosolar = "" }
                if (dataOrder.orderVolume.dexlite !== 0) {
                    dexlite = "dexlite " + String(dataOrder.orderVolume.dexlite) + " kl, "
                } else { dexlite = "" }
                if (dataOrder.orderVolume.pertadex !== 0) {
                    pertadex = "pertadex " + String(dataOrder.orderVolume.pertadex) + " kl, "
                } else { pertadex = "" }
                if (dataOrder.orderVolume.pertalite !== 0) {
                    pertalite = "pertalite " + String(dataOrder.orderVolume.pertalite) + " kl, "
                } else { pertalite = "" }
                if (dataOrder.orderVolume.pertamax !== 0) {
                    pertamax = "pertamax " + String(dataOrder.orderVolume.pertamax) + " kl, "
                } else { pertamax = "" }
                if (dataOrder.orderVolume.premium !== 0) {
                    premium = "premium " + String(dataOrder.orderVolume.premium) + " kl, "
                } else { premium = "" }
                if (dataOrder.orderVolume.pxturbo !== 0) {
                    pxturbo = "pxturbo " + String(dataOrder.orderVolume.pxturbo) + " kl, "
                } else { pxturbo = "" }

                stringVolume = biosolar + dexlite + pertadex + pertalite + pertamax + premium + pxturbo
                stringVolume = stringVolume.substr(0, stringVolume.length - 2)
                type = dataOrder.type
            }

            const notificationsUser = await db.collection('users/' + userId + '/notifications').doc()
            const notificationsSR = await db.collection('users/' + salesRetailId + '/notifications').doc()
            const notificationIdUser = notificationsUser.id
            const notificationIdSR = notificationsSR.id
            const titleUser = "Terima kasih"
            const bodyUser = "Anda telah menggunakan layanan " + type + " sejumlah " + stringVolume
            const titleSR = "Permintaan Baru"
            const bodySR = "Terdapat permintaan " + type + " baru dari " + name
            const open = true
            const createdOn = admin.firestore.Timestamp.now()

            let notificationId, title, body

            notificationId = notificationIdUser
            title = titleUser
            body = bodyUser
            const notificationDataUser = {
                notificationId,
                createdOn,
                title,
                body,
                open,
                type
            }

            notificationId = notificationIdSR
            title = titleSR
            body = bodySR
            const notificationDataSR = {
                notificationId,
                createdOn,
                title,
                body,
                open,
                type
            }

            await db.doc('users/' + userId + "/notifications/" + notificationIdUser).set(notificationDataUser, { merge: true })
                .then(function () {
                    console.log('Success: create notification user')
                })
                .catch(function (error) {
                    console.log(error)
                })

            await db.doc('users/' + salesRetailId + "/notifications/" + notificationIdSR).set(notificationDataSR, { merge: true })
                .then(function () {
                    console.log('Success: create notification SR')
                })
                .catch(function (error) {
                    console.log(error)
                })

            //notifikasi user
            const messageUser = {
                data: {
                    "title": titleUser,
                    "body": bodyUser,
                    "type": type
                },
                token: registrationTokenUser
            }

            admin.messaging().send(messageUser)
                .then((response) => {
                    console.log('Successfully sent message:', response)
                })
                .catch((error) => {
                    console.log('Error sending message:', error)
                })

            //notifikasi SR
            const docSR = await db.collection('users').doc(salesRetailId).get()
            const dtSR = docSR.data()
            let registrationTokenSR

            if (dtSR !== undefined) {
                registrationTokenSR = dtSR.token
            }

            const messageSR = {
                data: {
                    "title": titleSR,
                    "body": bodySR,
                    "type": type
                },
                token: registrationTokenSR
            }

            admin.messaging().send(messageSR)
                .then((response) => {
                    console.log('Successfully sent message:', response)
                })
                .catch((error) => {
                    console.log('Error sending message:', error)
                })

        } catch (error) {
            console.log(error)
        }
    })

exports.onUpdateOrder = functions.firestore
    .document('users/{userId}/orders/{orderId}')
    .onUpdate(async (change, context) => {
        try {
            const userId = context.params.userId
            const orderId = context.params.orderId
            const newValue = change.after.data()
            const previousValue = change.before.data()

            const user = await db.collection('users').doc(userId).get()
            const order = await db.collection('orders').doc(orderId).get()

            const ssgaId = '1GJiQL1yVPULwtM5BiacBXDCv8Y2'
            const ohId = 'pyo93kufMWa5yRiIQ82w9q454n13'
            const pnId = 'OGliHFqeIVRsM00G2Kq1CrnSKEu1'

            const dataUser = user.data()
            let nameUser, registrationTokenUser
            //mendapatkan isi field document dari user ybs
            if (dataUser !== undefined) {
                nameUser = dataUser.nameUser
                registrationTokenUser = dataUser.token
            }

            const dataOrder = order.data()
            let type
            //mendapatkan isi field document dari order
            if (dataOrder !== undefined) {
                type = dataOrder.type
            }

            let n_complete, p_complete
            let n_confirmOH, p_confirmOH
            let n_confirmPN, p_confirmPN
            let n_confirmSR, p_confirmSR
            let n_confirmSSGA, p_confirmSSGA

            //mendapatkan nilai seluruh field sesudah diupdate
            if (newValue !== undefined) {
                n_complete = newValue.orderConfirmation.complete
                n_confirmOH = newValue.orderConfirmation.confirmOH
                n_confirmPN = newValue.orderConfirmation.confirmPN
                n_confirmSR = newValue.orderConfirmation.confirmSR
                n_confirmSSGA = newValue.orderConfirmation.confirmSSGA
            }

            //mendapatkan nilai seluruh field sebelum diupdate
            if (previousValue !== undefined) {
                p_complete = previousValue.orderConfirmation.complete
                p_confirmOH = previousValue.orderConfirmation.confirmOH
                p_confirmPN = previousValue.orderConfirmation.confirmPN
                p_confirmSR = previousValue.orderConfirmation.confirmSR
                p_confirmSSGA = previousValue.orderConfirmation.confirmSSGA
            }

            //ditolak
            if (n_complete !== p_complete && n_complete === true) {
                const title = "Permintaan ditolak"
                const open = false
                const createdOn = admin.firestore.Timestamp.now()

                //tolak SR
                if (n_confirmOH === false && n_confirmPN === false && n_confirmSR === false && n_confirmSSGA === false) {
                    console.log('TOLAK SR')

                    //buat dokumen notification
                    const notifications = await db.collection('users/' + userId + '/notifications').doc()
                    const notificationId = notifications.id
                    const body = "Permintaan " + String(type) + " yang kamu ajukan ditolak oleh SR"

                    const notificationData = {
                        notificationId,
                        createdOn,
                        title,
                        body,
                        open,
                        type
                    }

                    await db.doc('users/' + userId + "/notifications/" + notificationId).set(notificationData, { merge: true })
                        .then(function () {
                            console.log('Success: create notification user')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })

                    //notifikasi
                    const messageUser = {
                        data: {
                            "title": title,
                            "body": body,
                            "type": type
                        },
                        token: registrationTokenUser
                    }

                    admin.messaging().send(messageUser)
                        .then((response) => {
                            console.log('Successfully sent message:', response)
                        })
                        .catch((error) => {
                            console.log('Error sending message:', error)
                        })
                }

                //tolak SSGA
                else if (n_confirmOH === false && n_confirmPN === false && n_confirmSR === true && n_confirmSSGA === false) {
                    console.log('TOLAK SSGA')

                    //buat dokumen notification
                    const notifications = await db.collection('users/' + userId + '/notifications').doc()
                    const notificationId = notifications.id
                    const body = "Permintaan " + String(type) + " yang kamu ajukan ditolak oleh SSGA"

                    const notificationData = {
                        notificationId,
                        createdOn,
                        title,
                        body,
                        open,
                        type
                    }

                    await db.doc('users/' + userId + "/notifications/" + notificationId).set(notificationData, { merge: true })
                        .then(function () {
                            console.log('Success: create notification user')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })

                    //notifikasi
                    const messageUser = {
                        data: {
                            "title": title,
                            "body": body,
                            "type": type
                        },
                        token: registrationTokenUser
                    }

                    admin.messaging().send(messageUser)
                        .then((response) => {
                            console.log('Successfully sent message:', response)
                        })
                        .catch((error) => {
                            console.log('Error sending message:', error)
                        })
                }

                //tolak OH
                else if (n_confirmOH === false && n_confirmPN === false && n_confirmSR === true && n_confirmSSGA === true) {
                    console.log('TOLAK OH')

                    //buat dokumen notification
                    const notifications = await db.collection('users/' + userId + '/notifications').doc()
                    const notificationId = notifications.id
                    const body = "Permintaan " + String(type) + " yang kamu ajukan ditolak oleh OH"

                    const notificationData = {
                        notificationId,
                        createdOn,
                        title,
                        body,
                        open,
                        type
                    }

                    await db.doc('users/' + userId + "/notifications/" + notificationId).set(notificationData, { merge: true })
                        .then(function () {
                            console.log('Success: create notification user')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })

                    //notifikasi
                    const messageUser = {
                        data: {
                            "title": title,
                            "body": "Permintaan " + type + " yang kamu ajukan ditolak oleh OH",
                            "type": type
                        },
                        token: registrationTokenUser
                    }

                    admin.messaging().send(messageUser)
                        .then((response) => {
                            console.log('Successfully sent message:', response)
                        })
                        .catch((error) => {
                            console.log('Error sending message:', error)
                        })
                }

                //tolak PN
                else if (n_confirmOH === true && n_confirmPN === false && n_confirmSR === true && n_confirmSSGA === true) {
                    console.log('TOLAK PN')

                    //buat dokumen notification
                    const notifications = await db.collection('users/' + userId + '/notifications').doc()
                    const notificationId = notifications.id
                    const body = "Permintaan " + String(type) + " yang kamu ajukan ditolak oleh PN"

                    const notificationData = {
                        notificationId,
                        createdOn,
                        title,
                        body,
                        open,
                        type
                    }

                    await db.doc('users/' + userId + "/notifications/" + notificationId).set(notificationData, { merge: true })
                        .then(function () {
                            console.log('Success: create notification user')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })

                    //notifikasi
                    const messageUser = {
                        data: {
                            "title": title,
                            "body": "Permintaan " + type + " yang kamu ajukan ditolak oleh PN",
                            "type": type
                        },
                        token: registrationTokenUser
                    }

                    admin.messaging().send(messageUser)
                        .then((response) => {
                            console.log('Successfully sent message:', response)
                        })
                        .catch((error) => {
                            console.log('Error sending message:', error)
                        })
                }

                else {
                    console.log('TOLAK (ERROR)')
                }
            }

            //acc PN
            else if (n_confirmPN !== p_confirmPN) {
                if (n_confirmOH === true && n_confirmPN === true && n_confirmSR === true && n_confirmSSGA === true) {
                    console.log('ACC PN')

                    //buat dokumen notification
                    const notifications = await db.collection('users/' + userId + '/notifications').doc()
                    const notificationId = notifications.id
                    const title = "Permintaan disetujui"
                    const body = "Permintaan " + String(type) + " yang kamu ajukan telah disetujui oleh PN"
                    const open = false
                    const createdOn = admin.firestore.Timestamp.now()

                    const notificationData = {
                        notificationId,
                        createdOn,
                        title,
                        body,
                        open,
                        type
                    }

                    await db.doc('users/' + userId + "/notifications/" + notificationId).set(notificationData, { merge: true })
                        .then(function () {
                            console.log('Success: create notification user')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })

                    //notifikasi
                    const messageUser = {
                        data: {
                            "title": title,
                            "body": body,
                            "type": type
                        },
                        token: registrationTokenUser
                    }

                    admin.messaging().send(messageUser)
                        .then((response) => {
                            console.log('Successfully sent message:', response)
                        })
                        .catch((error) => {
                            console.log('Error sending message:', error)
                        })
                }
            }

            //acc OH
            else if (n_confirmOH !== p_confirmOH) {
                if (n_confirmOH === true && n_confirmPN === false && n_confirmSR === true && n_confirmSSGA === true) {
                    console.log('ACC OH')

                    //buat dokumen notification
                    const notificationsUser = await db.collection('users/' + userId + '/notifications').doc()
                    const notificationsPN = await db.collection('users/' + pnId + '/notifications').doc()
                    const notificationIdUser = notificationsUser.id
                    const notificationIdPN = notificationsPN.id
                    const titleUser = "Permintaan disetujui"
                    const bodyUser = "Permintaan " + String(type) + " yang kamu ajukan telah disetujui oleh OH"
                    const titlePN = "Permintaan Baru"
                    const bodyPN = "Terdapat permintaan " + type + " baru dari " + nameUser
                    const open = true
                    const createdOn = admin.firestore.Timestamp.now()

                    let notificationId, title, body

                    notificationId = notificationIdUser
                    title = titleUser
                    body = bodyUser
                    const notificationDataUser = {
                        notificationId,
                        createdOn,
                        title,
                        body,
                        open,
                        type
                    }

                    notificationId = notificationIdPN
                    title = titlePN
                    body = bodyPN
                    const notificationDataPN = {
                        notificationId,
                        createdOn,
                        title,
                        body,
                        open,
                        type
                    }

                    await db.doc('users/' + userId + "/notifications/" + notificationIdUser).set(notificationDataUser, { merge: true })
                        .then(function () {
                            console.log('Success: create notification user')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })

                    await db.doc('users/' + pnId + "/notifications/" + notificationIdPN).set(notificationDataPN, { merge: true })
                        .then(function () {
                            console.log('Success: create notification PN')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })

                    //notifikasi
                    const docPN = await db.collection('users').doc(pnId).get()
                    const dtPN = docPN.data()

                    let registrationTokenPN
                    if (dtPN !== undefined) {
                        registrationTokenPN = dtPN.token
                    }

                    //notif user
                    const messageUser = {
                        data: {
                            "title": titleUser,
                            "body": bodyUser,
                            "type": type
                        },
                        token: registrationTokenUser
                    }

                    admin.messaging().send(messageUser)
                        .then((response) => {
                            console.log('Successfully sent message:', response)
                        })
                        .catch((error) => {
                            console.log('Error sending message:', error)
                        })

                    //notif PN
                    const messagePN = {
                        data: {
                            "title": titlePN,
                            "body": bodyPN,
                            "type": type
                        },
                        token: registrationTokenPN
                    }

                    admin.messaging().send(messagePN)
                        .then((response) => {
                            console.log('Successfully sent message:', response)
                        })
                        .catch((error) => {
                            console.log('Error sending message:', error)
                        })
                }
            }

            //acc SSGA
            else if (n_confirmSSGA !== p_confirmSSGA) {
                if (n_confirmOH === false && n_confirmPN === false && n_confirmSR === true && n_confirmSSGA === true) {
                    console.log('ACC SSGA')

                    //buat dokumen notification
                    const notificationsUser = await db.collection('users/' + userId + '/notifications').doc()
                    const notificationsOH = await db.collection('users/' + ohId + '/notifications').doc()
                    const notificationIdUser = notificationsUser.id
                    const notificationIdOH = notificationsOH.id
                    const titleUser = "Permintaan disetujui"
                    const bodyUser = "Permintaan " + String(type) + " yang kamu ajukan telah disetujui oleh SSGA"
                    const titleOH = "Permintaan Baru"
                    const bodyOH = "Terdapat permintaan " + type + " baru dari " + nameUser
                    const open = true
                    const createdOn = admin.firestore.Timestamp.now()

                    let notificationId, title, body

                    notificationId = notificationIdUser
                    title = titleUser
                    body = bodyUser
                    const notificationDataUser = {
                        notificationId,
                        createdOn,
                        title,
                        body,
                        open,
                        type
                    }

                    notificationId = notificationIdOH
                    title = titleOH
                    body = bodyOH
                    const notificationDataOH = {
                        notificationId,
                        createdOn,
                        title,
                        body,
                        open,
                        type
                    }

                    await db.doc('users/' + userId + "/notifications/" + notificationIdUser).set(notificationDataUser, { merge: true })
                        .then(function () {
                            console.log('Success: create notification user')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })

                    await db.doc('users/' + ohId + "/notifications/" + notificationIdOH).set(notificationDataOH, { merge: true })
                        .then(function () {
                            console.log('Success: create notification OH')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })

                    //notifikasi
                    const docOH = await db.collection('users').doc(ohId).get()
                    const dtOH = docOH.data()

                    let registrationTokenOH
                    if (dtOH !== undefined) {
                        registrationTokenOH = dtOH.token
                    }

                    //notif user
                    const messageUser = {
                        data: {
                            "title": titleUser,
                            "body": bodyUser,
                            "type": type
                        },
                        token: registrationTokenUser
                    }

                    admin.messaging().send(messageUser)
                        .then((response) => {
                            console.log('Successfully sent message:', response)
                        })
                        .catch((error) => {
                            console.log('Error sending message:', error)
                        })

                    //notif OH
                    const messageOH = {
                        data: {
                            "title": titleOH,
                            "body": bodyOH,
                            "type": type
                        },
                        token: registrationTokenOH
                    }

                    admin.messaging().send(messageOH)
                        .then((response) => {
                            console.log('Successfully sent message:', response)
                        })
                        .catch((error) => {
                            console.log('Error sending message:', error)
                        })
                }
            }

            //acc SR
            else if (n_confirmSR !== p_confirmSR) {
                if (n_confirmOH === false && n_confirmPN === false && n_confirmSR === true && n_confirmSSGA === false) {
                    console.log('ACC SR')

                    //buat dokumen notification
                    const notificationsUser = await db.collection('users/' + userId + '/notifications').doc()
                    const notificationsSSGA = await db.collection('users/' + ssgaId + '/notifications').doc()
                    const notificationIdUser = notificationsUser.id
                    const notificationIdSSGA = notificationsSSGA.id
                    const titleUser = "Permintaan disetujui"
                    const bodyUser = "Permintaan " + String(type) + " yang kamu ajukan telah disetujui oleh SR"
                    const titleSSGA = "Permintaan Baru"
                    const bodySSGA = "Terdapat permintaan " + type + " baru dari " + nameUser
                    const open = true
                    const createdOn = admin.firestore.Timestamp.now()

                    let notificationId, title, body

                    notificationId = notificationIdUser
                    title = titleUser
                    body = bodyUser
                    const notificationDataUser = {
                        notificationId,
                        createdOn,
                        title,
                        body,
                        open,
                        type
                    }

                    notificationId = notificationIdSSGA
                    title = titleSSGA
                    body = bodySSGA
                    const notificationDataSSGA = {
                        notificationId,
                        createdOn,
                        title,
                        body,
                        open,
                        type
                    }

                    await db.doc('users/' + userId + "/notifications/" + notificationIdUser).set(notificationDataUser, { merge: true })
                        .then(function () {
                            console.log('Success: create notification user')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })

                    await db.doc('users/' + ssgaId + "/notifications/" + notificationIdSSGA).set(notificationDataSSGA, { merge: true })
                        .then(function () {
                            console.log('Success: create notification SSGA')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })

                    //notifikasi
                    const docSSGA = await db.collection('users').doc(ssgaId).get()
                    const dtSSGA = docSSGA.data()

                    let registrationTokenSSGA
                    if (dtSSGA !== undefined) {
                        registrationTokenSSGA = dtSSGA.token
                    }

                    //notif user
                    const messageUser = {
                        data: {
                            "title": titleUser,
                            "body": bodyUser,
                            "type": type
                        },
                        token: registrationTokenUser
                    }

                    admin.messaging().send(messageUser)
                        .then((response) => {
                            console.log('Successfully sent message:', response)
                        })
                        .catch((error) => {
                            console.log('Error sending message:', error)
                        })

                    //notif OH
                    const messageSSGA = {
                        data: {
                            "title": titleSSGA,
                            "body": bodySSGA,
                            "type": type
                        },
                        token: registrationTokenSSGA
                    }

                    admin.messaging().send(messageSSGA)
                        .then((response) => {
                            console.log('Successfully sent message:', response)
                        })
                        .catch((error) => {
                            console.log('Error sending message:', error)
                        })
                }
            }

            else {
                console.log("Trigger update nothing")
            }

            //selesai
            if (n_complete !== p_complete && n_complete === true) {
                if (n_confirmOH === true && n_confirmPN === true && n_confirmSR === true && n_confirmSSGA === true) {

                    //buat dokumen notification
                    const notifications = await db.collection('users/' + userId + '/notifications').doc()
                    const notificationId = notifications.id
                    const title = "Permintaan selesai"
                    const body = "Permintaan " + String(type) + " yang kamu ajukan telah disetujui dan akan diproses"
                    const open = false
                    const createdOn = admin.firestore.Timestamp.now()

                    const notificationData = {
                        notificationId,
                        createdOn,
                        title,
                        body,
                        open,
                        type
                    }

                    await db.doc('users/' + userId + "/notifications/" + notificationId).set(notificationData, { merge: true })
                        .then(function () {
                            console.log('Success: create notification user')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })

                    //notif user
                    const messageUser = {
                        data: {
                            "title": title,
                            "body": body,
                            "type": type
                        },
                        token: registrationTokenUser
                    }

                    admin.messaging().send(messageUser)
                        .then((response) => {
                            console.log('Successfully sent message:', response)
                        })
                        .catch((error) => {
                            console.log('Error sending message:', error)
                        })
                } else {
                    console.log("Nothing")
                }
            } else {
                console.log("Nothing")
            }

        } catch (error) {
            console.log(error)
        }
    })