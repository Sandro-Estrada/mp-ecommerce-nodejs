const { Router } = require('express')
const Checkout = require('../libs/checkout')

const router = Router()

router.get('/', (req, res) => {
    try {
        res.render('home', {
            query: req.query
        });
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
});

router.get('/detail', async (req, res) => {
    try {
        const {
            query: {
                title: description,
                price,
                unit: quantity,
                img
            }
        } = req
        const data = {
            description,
            price,
            quantity,
            img
        }
        const checkout = await Checkout.createPreference(data)
        res.render('detail', {
            ...req.query,
            ...checkout
        });
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
});

router.get('/feedback', (req, res) => {
    res.json({
       Payment: req.query.payment_id,
       Status: req.query.status,
       MerchantOrder: req.query.merchant_order_id
   })
});

router.get('/fail', (req, res) => {
    res.render('fail', req.query);
});

router.get('/pending', (req, res) => {
    res.render('pending', req.query);
});

router.post('/notifications/ipn', async (req, res) => {
    const {
        query: {
            topic,
            id
        }
    } = req
    let merchandOrder = null
    switch (topic) {
        case 'payment':
            const payment = await Checkout.findPaymentById(id)
            const {
                payment: {
                    order: {
                        id: paymentId
                    }
                }
            } = payment
            merchandOrder = await Checkout.findMerchantOrderById(paymentId)
            break
        case 'merchant_order':
            merchandOrder = await Checkout.findMerchantOrderById(id)
            break
        default:
            break
    }
    if (!merchandOrder) {
        return res.status(400).json({
            message: 'something bad happend'
        })
    }
    const merchandStatus = Checkout.getMerchantOrderStatus(merchandOrder)
    res.json({
        merchandStatus,
        query: req.query
   })
})


router.post('/notifications/weebhooks', async (req, res) => {
    try {
        const {
            type = null,
            data
        } = req.body
        let response = null
        switch(type) {
            case "payment":
                response = await Checkout.findPaymentById(data.id)
                break
            case "plan":
                response = await Checkout.findPlanById(data.id)
                break
            case "subscription":
                response = await Checkout.findSubscriptionById(data.id)
                break
            case "invoice":
                response = await Checkout.findInvoiceById(data.id)
                break
            default:
                break
        }

        const payload = type ? req.body : req.query
        res.json(payload)
    } catch (error) {
        console.error(error)
        res.status(500).json(error)
    }
})

module.exports = router
