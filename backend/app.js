const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize('chemical_compounds', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});

const Compound = sequelize.define('Compound', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  name: DataTypes.STRING,
  image: DataTypes.STRING,
  description: DataTypes.TEXT,
  image_attribution: DataTypes.STRING,
  date_modified: DataTypes.DATE
});

// Routes
app.get('/api/compounds', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  
  const { count, rows } = await Compound.findAndCountAll({
    limit,
    offset
  });
  
  res.json({
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
    data: rows
  });
});

app.get('/api/compounds/:id', async (req, res) => {
  const compound = await Compound.findByPk(req.params.id);
  if (!compound) {
    return res.status(404).json({ error: 'Compound not found' });
  }
  res.json(compound);
});

app.put('/api/compounds/:id', async (req, res) => {
  const { name, image, description } = req.body;
  
  if (!name || !image || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const [updated] = await Compound.update(
    { name, image, description, date_modified: new Date() },
    { where: { id: req.params.id } }
  );
  
  if (updated) {
    const updatedCompound = await Compound.findByPk(req.params.id);
    return res.json(updatedCompound);
  }
  
  res.status(404).json({ error: 'Compound not found' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});