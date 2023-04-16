
const express = require('express');
const Joi = require('joi');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Connect to the MongoDB database
mongoose.connect('mongodb+srv://a6dubey11:Demo123@cluster0.jlzbz7q.mongodb.net/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Error connecting to MongoDB:', error));

// Define the customer schema
const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  }
});

// Define the Customer model
const Customer = mongoose.model('Customer', customerSchema);

// Define a Joi schema for validating customer data
const customerSchemaJoi = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required()
});

// Define the routes
const router = express.Router();

// GET a customer by ID
router.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).send('Customer not found');
    }
    res.send(customer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving customer');
  }
});

// PUT update a customer by ID
router.put('/api/customers/:id', async (req, res) => {
  const { error } = customerSchemaJoi.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) {
      return res.status(404).send('Customer not found');
    }
    res.send(customer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating customer');
  }
});

// POST add a new customer
router.post('/api/customers', async (req, res) => {
  const { error } = customerSchemaJoi.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  try {
    const customer = new Customer({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone
    });
    const result = await customer.save();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding customer');
  }
});


// Define a new route for getting all customers
app.get('/api/customers', async (req, res) => {
    try {
      // Query the database for all customers
      const customers = await Customer.find({});
  
      // If no customers are found, return a 404 error
      if (customers.length === 0) {
        return res.status(404).json({ error: 'No customers found.' });
      }
  
      // If customers are found, return them as JSON
      res.json(customers);
    } catch (error) {
      // If an error occurs while querying the database, return a 500 error
      res.status(500).json({ error: 'Server error. Please try again later.' });
    }
  });
  

// Mount the router onto the app
app.use(router);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
