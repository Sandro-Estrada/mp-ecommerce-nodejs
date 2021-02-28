const express = require('express');
const exphbs  = require('express-handlebars');
const mercadopago = require("mercadopago");
const path = require('path')
const routes = require('./routes/handlers')
const helpers = require('./libs/helpers')

const port = process.env.PORT || 3000

mercadopago.configure({
    integrator_id: 'dev_24c65fb163bf11ea96500242ac130004',
    access_token: 'APP_USR-1159009372558727-072921-8d0b9980c7494985a5abd19fbe921a3d-617633181'
})

const app = express();
 
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: {
        ...helpers
    }
}));
app.set('view engine', 'handlebars');

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));

app.use('/', routes)

app.listen(port);