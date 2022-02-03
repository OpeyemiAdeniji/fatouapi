import Axios from 'axios';


const config = {
    headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/json'
    }
}
