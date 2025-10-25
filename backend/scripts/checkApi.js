require('dotenv').config()
const axios = require('axios')

async function main() {
  const base = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`
  const url = `${base}/api/health`
  try {
    const res = await axios.get(url, { timeout: 5000 })
    console.log('✅ API OK:', url)
    console.log(res.data)
  } catch (err) {
    console.error('❌ API indisponível em:', url)
    console.error(err.message)
    process.exitCode = 1
  }
}

main()
