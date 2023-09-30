import mongoose from 'mongoose';

export const { ObjectId } = mongoose.Types;
export default (collection) => mongoose.connection.db.collection(collection);
