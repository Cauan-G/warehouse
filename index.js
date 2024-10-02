//gerar codigo de barras e qr code do produto
//gerar codigo do produto
const express = require('express')
const exphbs = require('express-handlebars')
const mysql = require('mysql')


const app = express()

app.use(
    express.urlencoded({
        extended:true,
    }),

)

const hbs = exphbs.create({ extname: '.handlebars' })

app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')

app.use(express.static('public'))


app.get('/employee', (req, res) => {
    res.render('employee')
})
app.get('/product', (req, res) => {
    res.render('product')
})
app.get('/', (req, res) => {
    res.render('home')
})

app.post('/warehouse/insertemploye', (req, res) => {

    const name = req.body.name
    const cpf = req.body.cpf
    const hire_date = req.body.hire_date

    const sql = `INSERT INTO employee (NAME, CPF, HIRE_DATE) VALUES ('${name}', '${cpf}', '${hire_date}')`

    conection.query(sql, function(err){
        if(err) {
            console.log(err)
        }

        res.redirect('/')
    })
})

app.post('/warehouse/insertproduct', (req, res) => {

    const product = req.body.product
    const code = req.body.code
    const datetime = new Date().toISOString().slice(0, 19).replace('T', ' '); //'YYYY-MM-DD HH:MM:SS'

    const sql = `INSERT INTO product (NAME, CODE, CREATION_DATE) VALUES ('${product}', '${code}', '${datetime}')`

    conection.query(sql, function(err){
        if(err) {
            console.log(err)
        }

        res.redirect('/product')
    })
})

const conection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'warehouse',
})

conection.connect(function(err){
    if(err) console.log(err)

    console.log('Conectou sql')

    app.listen(3000)
})