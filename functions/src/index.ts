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

//deklarasi variabel global
let idNotification = ''
const ssgaId = '1GJiQL1yVPULwtM5BiacBXDCv8Y2'
const ohId = 'pyo93kufMWa5yRiIQ82w9q454n13'
const pnId = 'OGliHFqeIVRsM00G2Kq1CrnSKEu1'

exports.onCreateOrder = functions.firestore
    .document('users/{userId}/orders/{orderId}')
    .onCreate(async (snapshot, context) => {
        try {
            const userId = context.params.userId
            const orderId = context.params.orderId

            const user = await db.collection('users').doc(userId).get()
            const order = await db.collection('users/' + userId + '/orders').doc(orderId).get()

            const dataUser = user.data()
            let nameUser, srId, registrationTokenUser
            if (dataUser !== undefined) {
                nameUser = dataUser.name
                srId = dataUser.salesRetailId
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
            const notificationIdUser = notificationsUser.id
            const titleUser = "Terima Kasih"
            const bodyUser = "Anda telah menggunakan layanan " + String(type).toUpperCase() + " sejumlah: " + stringVolume + ".\nMohon menunggu persetujuan dari TBBM Malang"

            const notificationsAtasan = await db.collection('users/' + srId + '/notifications').doc()
            const notificationIdAtasan = notificationsAtasan.id
            const titleAtasan = "SPBU " + String(nameUser)
            const status = "\nMenunggu konfirmasi dari SR"
            const bodyAtasan = "Terdapat permintaan " + String(type).toUpperCase() + " sejumlah: " + stringVolume + ". " + status

            const open = true
            const createdOn = admin.firestore.Timestamp.now()

            await db.collection('users/' + ssgaId + '/notifications').doc(notificationIdAtasan)
            await db.collection('users/' + ohId + '/notifications').doc(notificationIdAtasan)
            await db.collection('users/' + pnId + '/notifications').doc(notificationIdAtasan)

            idNotification = notificationIdAtasan

            let notificationId, title, body
            notificationId = notificationIdUser
            title = titleUser
            body = bodyUser
            const notificationDataUser = {
                notificationId,
                orderId,
                createdOn,
                title,
                body,
                open,
                type
            }
            notificationId = notificationIdAtasan
            title = titleAtasan
            body = bodyAtasan
            const notificationDataAtasan = {
                notificationId,
                orderId,
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

            await db.doc('users/' + srId + "/notifications/" + notificationIdAtasan).set(notificationDataAtasan, { merge: true })
                .then(function () {
                    console.log('Success: create notification SR')
                })
                .catch(function (error) {
                    console.log(error)
                })
            await db.doc('users/' + ssgaId + "/notifications/" + notificationIdAtasan).set(notificationDataAtasan, { merge: true })
                .then(function () {
                    console.log('Success: create notification SSGA')
                })
                .catch(function (error) {
                    console.log(error)
                })
            await db.doc('users/' + ohId + "/notifications/" + notificationIdAtasan).set(notificationDataAtasan, { merge: true })
                .then(function () {
                    console.log('Success: create notification OH')
                })
                .catch(function (error) {
                    console.log(error)
                })
            await db.doc('users/' + pnId + "/notifications/" + notificationIdAtasan).set(notificationDataAtasan, { merge: true })
                .then(function () {
                    console.log('Success: create notification PN')
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

            sendNotification(messageUser)

            //notifikasi atasan
            const docPN = await db.collection('users').doc(pnId).get()
            const dtPN = docPN.data()
            let registrationTokenPN
            if (dtPN !== undefined) {
                registrationTokenPN = dtPN.token
            }
            const docOH = await db.collection('users').doc(ohId).get()
            const dtOH = docOH.data()
            let registrationTokenOH
            if (dtOH !== undefined) {
                registrationTokenOH = dtOH.token
            }
            const docSSGA = await db.collection('users').doc(ssgaId).get()
            const dtSSGA = docSSGA.data()
            let registrationTokenSSGA
            if (dtSSGA !== undefined) {
                registrationTokenSSGA = dtSSGA.token
            }
            const docSR = await db.collection('users').doc(srId).get()
            const dtSR = docSR.data()
            let registrationTokenSR
            if (dtSR !== undefined) {
                registrationTokenSR = dtSR.token
            }

            title = "Permintaan Baru"
            body = "Terdapat permintaan " + String(type).toUpperCase() + " dari SPBU " + String(nameUser).toUpperCase()
            const messagePN = {
                data: {
                    "title": title,
                    "body": body,
                    "type": type
                },
                token: registrationTokenPN
            }
            const messageOH = {
                data: {
                    "title": title,
                    "body": body,
                    "type": type
                },
                token: registrationTokenOH
            }
            const messageSSGA = {
                data: {
                    "title": title,
                    "body": body,
                    "type": type
                },
                token: registrationTokenSSGA
            }
            const messageSR = {
                data: {
                    "title": title,
                    "body": body,
                    "type": type
                },
                token: registrationTokenSR
            }

            sendNotification(messageSR)
            sendNotification(messageSSGA)
            sendNotification(messageOH)
            sendNotification(messagePN)

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

            const dataUser = user.data()
            let registrationTokenUser, nameUser, srId
            //mendapatkan isi field document dari user ybs
            if (dataUser !== undefined) {
                registrationTokenUser = dataUser.token
                nameUser = dataUser.name
                srId = dataUser.salesRetailId
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
            if (n_complete !== p_complete && n_complete === true && n_confirmPN === false) {
                let title = "Permintaan Ditolak"
                const open = false
                const createdOn = admin.firestore.Timestamp.now()

                //tolak SR
                if (n_confirmOH === false && n_confirmPN === false && n_confirmSR === false && n_confirmSSGA === false) {
                    console.log('TOLAK SR')

                    //buat dokumen notification
                    const notifications = await db.collection('users/' + userId + '/notifications').doc()
                    const notificationId = notifications.id
                    let body = "Mohon maaf, permintaan " + String(type).toUpperCase() + " sejumlah: " + stringVolume + " yang diajukan tidak disetujui oleh TBBM Malang"

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

                    sendNotification(messageUser)

                    //buat dokumen notification
                    title = "SPBU " + String(nameUser).toUpperCase() + " (TOLAK)"
                    body = "Permintaan " + String(type).toUpperCase() + " sejumlah: " + stringVolume + " ditolak oleh SR"

                    const notificationDataAtasan = {
                        createdOn,
                        title,
                        body,
                        open
                    }

                    const snapNotification =
                        await db.collection('users/' + srId + '/notifications')
                            .where("orderId", "==", orderId)
                            .where("open", "==", true)
                            .get()

                    snapNotification.forEach(
                        (doc) => {
                            idNotification = doc.data().notificationId
                        }
                    )

                    await db.doc('users/' + srId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: update notification SR')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + ssgaId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: update notification SSGA')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + ohId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: update notification OH')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + pnId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: update notification PN')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                }

                //tolak SSGA
                else if (n_confirmOH === true && n_confirmPN === false && n_confirmSR === true && n_confirmSSGA === false) {
                    console.log('TOLAK SSGA')

                    //buat dokumen notification
                    const notifications = await db.collection('users/' + userId + '/notifications').doc()
                    const notificationId = notifications.id
                    let body = "Mohon maaf, permintaan " + String(type).toUpperCase() + " sejumlah: " + stringVolume + " yang diajukan tidak disetujui oleh TBBM Malang"

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

                    sendNotification(messageUser)

                    //buat dokumen notification
                    title = "SPBU " + String(nameUser).toUpperCase() + " (TOLAK)"
                    body = "Permintaan " + String(type).toUpperCase() + " sejumlah: " + stringVolume + " ditolak oleh SSGA"

                    const notificationDataAtasan = {
                        createdOn,
                        title,
                        body,
                        open
                    }

                    const snapNotification =
                        await db.collection('users/' + srId + '/notifications')
                            .where("orderId", "==", orderId)
                            .where("open", "==", true)
                            .get()

                    snapNotification.forEach(
                        (doc) => {
                            idNotification = doc.data().notificationId
                        }
                    )

                    await db.doc('users/' + srId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: update notification SR')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + ssgaId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: update notification SSGA')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + ohId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: update notification OH')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + pnId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: update notification PN')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                }

                //tolak OH
                else if (n_confirmOH === false && n_confirmPN === false && n_confirmSR === true && n_confirmSSGA === false) {
                    console.log('TOLAK OH')

                    //buat dokumen notification
                    const notifications = await db.collection('users/' + userId + '/notifications').doc()
                    const notificationId = notifications.id
                    let body = "Mohon maaf, permintaan " + String(type).toUpperCase() + " sejumlah: " + stringVolume + " yang diajukan tidak disetujui oleh TBBM Malang"

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

                    sendNotification(messageUser)

                    //buat dokumen notification
                    title = "SPBU " + String(nameUser).toUpperCase() + " (TOLAK)"
                    body = "Permintaan " + String(type).toUpperCase() + " sejumlah: " + stringVolume + " ditolak oleh OH"

                    const notificationDataAtasan = {
                        createdOn,
                        title,
                        body,
                        open
                    }

                    const snapNotification =
                        await db.collection('users/' + srId + '/notifications')
                            .where("orderId", "==", orderId)
                            .where("open", "==", true)
                            .get()

                    snapNotification.forEach(
                        (doc) => {
                            idNotification = doc.data().notificationId
                        }
                    )

                    await db.doc('users/' + srId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: update notification SR')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + ssgaId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: update notification SSGA')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + ohId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: update notification OH')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + pnId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: update notification PN')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                }

                //tolak PN
                else if (n_confirmOH === true && n_confirmPN === false && n_confirmSR === true && n_confirmSSGA === true) {
                    console.log('TOLAK PN')

                    //buat dokumen notification
                    const notifications = await db.collection('users/' + userId + '/notifications').doc()
                    const notificationId = notifications.id
                    let body = "Mohon maaf, permintaan " + String(type).toUpperCase() + " sejumlah: " + stringVolume + " yang diajukan tidak disetujui oleh TBBM Malang"

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

                    sendNotification(messageUser)

                    //buat dokumen notification
                    title = "SPBU " + String(nameUser).toUpperCase() + " (TOLAK)"
                    body = "Permintaan " + String(type).toUpperCase() + " sejumlah: " + stringVolume + " ditolak oleh PN"

                    const notificationDataAtasan = {
                        createdOn,
                        title,
                        body,
                        open
                    }

                    const snapNotification =
                        await db.collection('users/' + srId + '/notifications')
                            .where("orderId", "==", orderId)
                            .where("open", "==", true)
                            .get()

                    snapNotification.forEach(
                        (doc) => {
                            idNotification = doc.data().notificationId
                        }
                    )

                    await db.doc('users/' + srId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: update notification SR')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + ssgaId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: update notification SSGA')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + ohId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: update notification OH')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + pnId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: update notification PN')
                        })
                        .catch(function (error) {
                            console.log(error)
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
                    let title = "Permintaan Disetujui"
                    let body = "Permintaan " + String(type).toUpperCase() + " yang diajukan telah disetujui oleh TBBM Malang dan akan segera diproses"
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

                    sendNotification(messageUser)

                    //buat dokumen notification
                    title = "SPBU " + String(nameUser).toUpperCase() + " (ACC)"
                    body = "Permintaan " + String(type).toUpperCase() + " sejumlah: " + stringVolume + " telah disetujui, harap segera diproses"

                    const notificationDataAtasan = {
                        createdOn,
                        title,
                        body,
                        open
                    }

                    const snapNotification =
                        await db.collection('users/' + srId + '/notifications')
                            .where("orderId", "==", orderId)
                            .where("open", "==", true)
                            .get()

                    snapNotification.forEach(
                        (doc) => {
                            idNotification = doc.data().notificationId
                        }
                    )

                    await db.doc('users/' + srId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: create notification SR')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + ssgaId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: create notification SSGA')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + ohId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: create notification OH')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + pnId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: create notification PN')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                }
            }

            //acc OH
            else if (n_confirmOH !== p_confirmOH) {
                if (n_confirmOH === true && n_confirmPN === false && n_confirmSR === true && n_confirmSSGA === false) {
                    console.log('ACC OH')

                    //buat dokumen notification
                    const status = "\nMenunggu konfirmasi dari SSGA"
                    const body = "Terdapat permintaan " + String(type).toUpperCase() + " sejumlah: " + stringVolume + ". " + status
                    const createdOn = admin.firestore.Timestamp.now()

                    const notificationDataAtasan = {
                        createdOn,
                        body
                    }

                    const snapNotification =
                        await db.collection('users/' + srId + '/notifications')
                            .where("orderId", "==", orderId)
                            .where("open", "==", true)
                            .get()

                    snapNotification.forEach(
                        (doc) => {
                            idNotification = doc.data().notificationId
                        }
                    )

                    await db.doc('users/' + srId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: create notification SR')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + ssgaId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: create notification SSGA')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + ohId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: create notification OH')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + pnId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: create notification PN')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                }
            }

            //acc SSGA
            else if (n_confirmSSGA !== p_confirmSSGA) {
                if (n_confirmOH === true && n_confirmPN === false && n_confirmSR === true && n_confirmSSGA === true) {
                    console.log('ACC SSGA')

                    //buat dokumen notification
                    const status = "\nMenunggu konfirmasi dari PN"
                    const body = "Terdapat permintaan " + String(type).toUpperCase() + " sejumlah: " + stringVolume + ". " + status
                    const createdOn = admin.firestore.Timestamp.now()

                    const notificationDataAtasan = {
                        createdOn,
                        body
                    }

                    const snapNotification =
                        await db.collection('users/' + srId + '/notifications')
                            .where("orderId", "==", orderId)
                            .where("open", "==", true)
                            .get()

                    snapNotification.forEach(
                        (doc) => {
                            idNotification = doc.data().notificationId
                        }
                    )

                    await db.doc('users/' + srId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: create notification SR')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + ssgaId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: create notification SSGA')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + ohId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: create notification OH')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + pnId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: create notification PN')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                }
            }

            //acc SR
            else if (n_confirmSR !== p_confirmSR) {
                if (n_confirmOH === false && n_confirmPN === false && n_confirmSR === true && n_confirmSSGA === false) {
                    console.log('ACC SR')

                    //buat dokumen notification
                    const status = "\nMenunggu konfirmasi dari OH"
                    const body = "Terdapat permintaan " + String(type).toUpperCase() + " sejumlah: " + stringVolume + ". " + status
                    const createdOn = admin.firestore.Timestamp.now()

                    const notificationDataAtasan = {
                        createdOn,
                        body
                    }

                    const snapNotification =
                        await db.collection('users/' + srId + '/notifications')
                            .where("orderId", "==", orderId)
                            .where("open", "==", true)
                            .get()

                    snapNotification.forEach(
                        (doc) => {
                            idNotification = doc.data().notificationId
                        }
                    )

                    await db.doc('users/' + srId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: create notification SR')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + ssgaId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: create notification SSGA')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + ohId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: create notification OH')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                    await db.doc('users/' + pnId + "/notifications/" + idNotification).set(notificationDataAtasan, { merge: true })
                        .then(function () {
                            console.log('Success: create notification PN')
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                }
            }

            else {
                console.log("Trigger update nothing")
            }

        } catch (error) {
            console.log(error)
        }
    })

function sendNotification(message: any): void {
    admin.messaging().send(message)
        .then((response) => {
            console.log('Successfully sent message:', response)
        })
        .catch((error) => {
            console.log('Error sending message:', error)
        })
}

//function notifikasi all
// async function sendNotificationAll(): Promise<void> {
//     const snapUser = user.data()
//     let nameUser, srId
//     if (snapUser !== undefined) {
//         nameUser = snapUser.name
//         srId = snapUser.salesRetailId
//     }
//     const snapOrder = order.data()
//     let typeOrder
//     if (snapOrder !== undefined) {
//         typeOrder = snapOrder.type
//     }
//     type = typeOrder

//     let new_confirmOH, new_confirmPN, new_confirmSR, new_confirmSSGA
//     if (newValue !== undefined) {
//         new_confirmOH = newValue.orderConfirmation.confirmOH
//         new_confirmPN = newValue.orderConfirmation.confirmPN
//         new_confirmSR = newValue.orderConfirmation.confirmSR
//         new_confirmSSGA = newValue.orderConfirmation.confirmSSGA
//     } else {
//         console.log("Error new value")
//     }

//     let status
//     if (new_confirmPN === false && new_confirmOH === true && new_confirmSSGA === true && new_confirmSR === true) {
//         status = ". Menunggu konfirmasi dari PN"
//     } else if (new_confirmPN === false && new_confirmOH === false && new_confirmSSGA === true && new_confirmSR === true) {
//         status = ". Menunggu konfirmasi dari OH"
//     } else if (new_confirmPN === false && new_confirmOH === false && new_confirmSSGA === false && new_confirmSR === true) {
//         status = ". Menunggu konfirmasi dari SSGA"
//     } else if (new_confirmPN === false && new_confirmOH === true && new_confirmSSGA === false && new_confirmSR === false) {
//         status = ". Menunggu konfirmasi dari SR"
//     } else {
//         // console.log("Nothing")
//     }

//     const title = "Permintaan Baru"
//     const body = "Terdapat permintaan " + String(type).toUpperCase() + " baru dari " + String(nameUser).toUpperCase() + status

//     const docPN = await db.collection('users').doc(pnId).get()
//     const dtPN = docPN.data()
//     let registrationTokenPN
//     if (dtPN !== undefined) {
//         registrationTokenPN = dtPN.token
//     }
//     const docOH = await db.collection('users').doc(ohId).get()
//     const dtOH = docOH.data()
//     let registrationTokenOH
//     if (dtOH !== undefined) {
//         registrationTokenOH = dtOH.token
//     }
//     const docSSGA = await db.collection('users').doc(ssgaId).get()
//     const dtSSGA = docSSGA.data()
//     let registrationTokenSSGA
//     if (dtSSGA !== undefined) {
//         registrationTokenSSGA = dtSSGA.token
//     }
//     const docSR = await db.collection('users').doc(srId).get()
//     const dtSR = docSR.data()
//     let registrationTokenSR
//     if (dtSR !== undefined) {
//         registrationTokenSR = dtSR.token
//     }

//     const messagePN = {
//         data: {
//             "title": title,
//             "body": body,
//             "type": type
//         },
//         token: registrationTokenPN
//     }
//     const messageOH = {
//         data: {
//             "title": title,
//             "body": body,
//             "type": type
//         },
//         token: registrationTokenOH
//     }
//     const messageSSGA = {
//         data: {
//             "title": title,
//             "body": body,
//             "type": type
//         },
//         token: registrationTokenSSGA
//     }
//     const messageSR = {
//         data: {
//             "title": title,
//             "body": body,
//             "type": type
//         },
//         token: registrationTokenSR
//     }

//     admin.messaging().send(messagePN)
//         .then((response) => {
//             console.log('Successfully sent message:', response)
//         })
//         .catch((error) => {
//             console.log('Error sending message:', error)
//         })
//     admin.messaging().send(messageOH)
//         .then((response) => {
//             console.log('Successfully sent message:', response)
//         })
//         .catch((error) => {
//             console.log('Error sending message:', error)
//         })
//     admin.messaging().send(messageSSGA)
//         .then((response) => {
//             console.log('Successfully sent message:', response)
//         })
//         .catch((error) => {
//             console.log('Error sending message:', error)
//         })
//     admin.messaging().send(messageSR)
//         .then((response) => {
//             console.log('Successfully sent message:', response)
//         })
//         .catch((error) => {
//             console.log('Error sending message:', error)
//         })

//     const notificationsPN = await db.collection('users/' + pnId + '/notifications').doc()
//     const notificationIdPN = notificationsPN.id
//     const notificationsOH = await db.collection('users/' + ohId + '/notifications').doc()
//     const notificationIdOH = notificationsOH.id
//     const notificationsSSGA = await db.collection('users/' + ssgaId + '/notifications').doc()
//     const notificationIdSSGA = notificationsSSGA.id
//     const notificationsSR = await db.collection('users/' + srId + '/notifications').doc()
//     const notificationIdSR = notificationsSR.id
//     const open = true
//     const createdOn = admin.firestore.Timestamp.now()

//     let notificationId
//     notificationId = notificationIdPN
//     const notificationDataPN = {
//         notificationId,
//         createdOn,
//         title,
//         body,
//         open,
//         type
//     }
//     notificationId = notificationIdOH
//     const notificationDataOH = {
//         notificationId,
//         createdOn,
//         title,
//         body,
//         open,
//         type
//     }
//     notificationId = notificationIdSSGA
//     const notificationDataSSGA = {
//         notificationId,
//         createdOn,
//         title,
//         body,
//         open,
//         type
//     }
//     notificationId = notificationIdSR
//     const notificationDataSR = {
//         notificationId,
//         createdOn,
//         title,
//         body,
//         open,
//         type
//     }

//     await db.doc('users/' + pnId + "/notifications/" + notificationIdPN).set(notificationDataPN, { merge: true })
//         .then(function () {
//             console.log('Success: create notification PN')
//         })
//         .catch(function (error) {
//             console.log(error)
//         })
//     await db.doc('users/' + ohId + "/notifications/" + notificationIdOH).set(notificationDataOH, { merge: true })
//         .then(function () {
//             console.log('Success: create notification OH')
//         })
//         .catch(function (error) {
//             console.log(error)
//         })
//     await db.doc('users/' + ssgaId + "/notifications/" + notificationIdSSGA).set(notificationDataSSGA, { merge: true })
//         .then(function () {
//             console.log('Success: create notification SSGA')
//         })
//         .catch(function (error) {
//             console.log(error)
//         })
//     await db.doc('users/' + srId + "/notifications/" + notificationIdSR).set(notificationDataSR, { merge: true })
//         .then(function () {
//             console.log('Success: create notification SR')
//         })
//         .catch(function (error) {
//             console.log(error)
//         })
// }