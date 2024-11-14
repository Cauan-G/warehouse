const express = require('express');

const connection = require('../index');
const authMiddleware = require('../controllers/authMiddleware');

const router = express.Router();

//-----------------------------------GET----------------------------------

// Route to render employee page
router.get('/employee', (req, res) => {
    res.render('employee');
});

// Route to render product page
router.get('/product', authMiddleware, (req, res) => {
    res.render('product');
});

// Route to render supplier page
router.get('/supplier', authMiddleware, (req, res) => {
    res.render('supplier');
});


// Route to list product-supplier relationships
router.get('/product_supplier', authMiddleware, (req, res) => {
    let sql = '';
    const productName = req.query.productName;

    if (productName) {
        sql = `
        SELECT 
            p.PRODUCT_ID AS ID,
            p.NAME,
            s.NAME AS NAME_SUPPLIER,
            true AS product
        FROM product p
        LEFT JOIN PRODUCT_SUPPLIER ps ON p.PRODUCT_ID = ps.PRODUCT_ID
        LEFT JOIN SUPPLIER s ON ps.SUPPLIER_ID = s.SUPPLIER_ID
        WHERE p.NAME LIKE ?
        
        UNION
        
        SELECT
            SUPPLIER_ID AS ID,
            NAME,
            '',
            false AS product
        FROM SUPPLIER
        WHERE SUPPLIER.CONTRACT_END_DATE IS NULL;
        `;
        connection.query(sql, ['%' + productName + '%'], function (err, data) {
            if (err) {
                console.log(err);
                res.status(500).send("Error retrieving product-supplier.");
                return;
            }
            const product_supplier = data;
            res.render('product_supplier', { product_supplier });
        });
    } else {
        sql = `
        SELECT 
            p.PRODUCT_ID AS ID,
            p.NAME,
            s.NAME AS NAME_SUPPLIER,
            true AS product
        FROM product p
        LEFT JOIN PRODUCT_SUPPLIER ps ON p.PRODUCT_ID = ps.PRODUCT_ID
        LEFT JOIN SUPPLIER s ON ps.SUPPLIER_ID = s.SUPPLIER_ID
        
        UNION
        
        SELECT
            SUPPLIER_ID AS ID,
            NAME,
            '',
            false AS product
        FROM SUPPLIER
        WHERE SUPPLIER.CONTRACT_END_DATE IS NULL;
        `;
        connection.query(sql, function (err, data) {
            if (err) {
                console.log(err);
                res.status(500).send("Error retrieving product-supplier.");
                return;
            }
            const product_supplier = data;
            res.render('product_supplier', { product_supplier });
        });
    }
});

// Route to render the edit page for product-supplier relationship
router.get('/product_supplier/edit/:id', authMiddleware, (req, res) => {
    const productID = req.params.id;

    // Query to get the product-supplier relationship
    const sqlProductSupplier = `
    SELECT 
        p.PRODUCT_ID AS ID,
        p.NAME,
        s.SUPPLIER_ID,
        s.NAME AS NAME_SUPPLIER,
        ps.QUANTITY,
        ps.COST
    FROM product p
    LEFT JOIN PRODUCT_SUPPLIER ps ON p.PRODUCT_ID = ps.PRODUCT_ID
    LEFT JOIN SUPPLIER s ON ps.SUPPLIER_ID = s.SUPPLIER_ID
    WHERE p.PRODUCT_ID = ?`;

    // Query to get all suppliers
    const sqlSuppliers = `SELECT SUPPLIER_ID, NAME FROM SUPPLIER`;

    connection.query(sqlProductSupplier, [productID], function (err, productSupplierData) {
        if (err) {
            console.log(err);
            res.status(500).send("Error retrieving data for editing.");
            return;
        }

        const product_supplier = productSupplierData[0];

        // Query to get all suppliers
        connection.query(sqlSuppliers, function (err, suppliersData) {
            if (err) {
                console.log(err);
                res.status(500).send("Error retrieving suppliers.");
                return;
            }

            const suppliers = suppliersData;

            // Render the edit page
            res.render('edit_product_supplier', { product_supplier, suppliers });
        });
    });
});


router.get('/register', (req, res) => {
    res.render('register');
});
router.get('/login', (req, res) => {
    res.render('login');
});

// Home route
router.get('/', authMiddleware, (req, res) => {
    res.render('home');
})

//-----------------------------------POST----------------------------------


// Insert new employee
router.post('/warehouse/insertemployee', (req, res) => {
    const name = req.body.name;
    const cpf = req.body.cpf;
    const hire_date = req.body.hire_date;

    const sql = `INSERT INTO employee (NAME, CPF, HIRE_DATE) VALUES ('${name}', '${cpf}', '${hire_date}')`;

    connection.query(sql, function (err) {
        if (err) {
            console.log(err);
        }

        res.redirect('/');
    });
});

// Insert new product
router.post('/warehouse/insertproduct', (req, res) => {
    const product = req.body.product;
    const datetime = new Date().toISOString().slice(0, 19).replace('T', ' '); // 'YYYY-MM-DD HH:MM:SS'

    const sql = `INSERT INTO product (NAME, CREATION_DATE) VALUES ('${product}', '${datetime}')`;

    connection.query(sql, function (err) {
        if (err) {
            console.log(err);
        }

        res.redirect('/product');
    });
});

// Insert new supplier
router.post('/warehouse/insertsupplier', (req, res) => {
    const supplier = req.body.supplier;
    const cnpj = req.body.cnpj;
    const contract_date = req.body.contract_date;

    const sql = `INSERT INTO supplier (NAME, CNPJ, CONTRACT_START_DATE) VALUES ('${supplier}', '${cnpj}', '${contract_date}')`;

    connection.query(sql, function (err) {
        if (err) {
            console.log(err);
        }

        res.redirect('/supplier');
    });
});

// Save product-supplier relationship
router.post('/saveProductSupplier', async (req, res) => {
    const productID = req.body.productID;
    const supplierID = req.body[`supplier_${productID}`];

    // Adjust QUANTITY and COST as necessary
    const quantity = 0; // Set to actual value as needed
    const cost = 0;     // Set to actual value as needed

    try {
        const query = `
            INSERT INTO PRODUCT_SUPPLIER (PRODUCT_ID, SUPPLIER_ID, QUANTITY, COST)
            VALUES (?, ?, ?, ?)
        `;
        const values = [productID, supplierID, quantity, cost];

        await connection.query(query, values, (err) => {
            if (err) {
                console.error('Error saving product-supplier:', err);
                return res.status(500).send('Error saving product-supplier');
            }
            res.redirect('/success');
        });
    } catch (error) {
        console.error('Error saving product-supplier:', error);
        res.status(500).send('Error saving product-supplier');
    }
});

// Route to update product-supplier relationship
router.post('/product_supplier/update', (req, res) => {
    const productID = req.body.productID;
    const supplierID = req.body.supplierID;  // New supplier selected from the form
    const quantity = req.body.quantity;
    const cost = req.body.cost;

    const sql = `
    UPDATE PRODUCT_SUPPLIER 
    SET SUPPLIER_ID = ?, QUANTITY = ?, COST = ? 
    WHERE PRODUCT_ID = ?`;
    
    connection.query(sql, [supplierID, quantity, cost, productID], function (err) {
        if (err) {
            console.log(err);
            res.status(500).send("Error updating product-supplier.");
            return;
        }
        
        res.redirect('/product_supplier');
    });
});



module.exports = router;