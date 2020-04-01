import { Application } from 'egg';

export default (app: Application) => {
	const mongoose = app.mongoose;
	const Schema = mongoose.Schema;
	const CompoentSchema = new Schema({
    name: { type: String },
	  description: { type: String, default: ''},
    versions: { type: Array, default: [] },
    maintainers: { type: Array, default: []},
    keywords: { type: Array, default: []},
    bugs: { 
      url: { type: String, default: ''}
    },
    time: {
      created: { type: Date, default: Date.now()},
      modified: { type: Date, default: Date.now()}
    },
    users: { type: Array, default: []},
    license: { type: String }
	});
	return mongoose.model('Compoent', CompoentSchema);
}