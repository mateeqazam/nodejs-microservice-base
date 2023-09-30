import mongoose from 'mongoose';

export default (collection) => mongoose.connection.db.collection(collection);
