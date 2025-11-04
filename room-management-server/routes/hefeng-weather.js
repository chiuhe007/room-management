// routes/weather.js
const express = require('express')
const axios = require('axios')
const router = express.Router()

const API_KEY = '92657438385846bca0af9c94ba47af97'
const API_HOST = 'https://m54d92mtfc.re.qweatherapi.com'

router.get('/forecast3d', async (req, res) => {
    const locationId = req.query.locationId || '101030100'
    try {
        const result = await axios.get(`${API_HOST}/v7/weather/3d`, {
            params: {
                location: locationId,
                key: API_KEY
            }
        })
        res.json(result.data)
    } catch (err) {
        res.status(500).json({ msg: '天气获取失败', detail: err.message })
    }
})

router.get('/now', async (req, res) => {
    const locationId = req.query.locationId || '101030100'
    try {
        const result = await axios.get(`${API_HOST}/v7/weather/now`, {
            params: {
                location: locationId,
                key: API_KEY
            }
        })
        res.json(result.data)
    } catch (err) {
        res.status(500).json({ msg: '实时天气获取失败', detail: err.message })
    }
})

module.exports = router
