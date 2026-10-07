import axios from "axios"

const api =  axios.create({
    baseURL: "https://ai-expense-tracker-0q62.onrender.com/api",

    withCredentials: true,
})

export default api