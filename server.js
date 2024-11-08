import {server} from './index.js';
import { connectUsingMongoose } from './src/config/db.js';

server.listen(3000, ()=> {
    connectUsingMongoose();
    console.log("server is running on port 3000");
})