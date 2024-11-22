import { sequelize } from '../config/database.js';
import { insertRoles } from './Auth/models.js';
import app from './app.js';

sequelize.sync({ force : false }) // Change to 'true' only if you want to reset the database.
    .then(() => {
        console.log('Database sincronized');
        // insertRoles() // Insert roles in the database
        app.listen(3000, () => {
            console.log('Server Running on http://localhost:3000');
        });
    })
    .catch(error => {
        console.error('Error sincronizing database:', error);
    });