const fs = require('fs');
const csv = require('csv-parser');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('chemical_compounds', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});

const Compound = sequelize.define('Compound', {
  // Model attributes
  id: { type: DataTypes.INTEGER, primaryKey: true },
  name: DataTypes.STRING,
  image: DataTypes.STRING,
  description: DataTypes.TEXT,
  image_attribution: DataTypes.STRING,
  date_modified: DataTypes.DATE
});

async function importData() {
  await sequelize.sync({ force: true });
  
  const results = [];
  fs.createReadStream('compounds.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      for (const row of results) {
        await Compound.create({
          id: row.id,
          name: row.CompoundName,
          image: row.strImageSource,
          description: row.CompounrDescription,
          image_attribution: row.strImageAttribution,
          date_modified: new Date(row.dateModified)
        });
      }
      console.log('Data imported successfully');
      process.exit(0);
    });
}

importData();