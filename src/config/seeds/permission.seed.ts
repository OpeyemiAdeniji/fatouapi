// import fs from 'fs';
// import colors from 'colors';

// import Permission from '../../models/Permission';

// // read in the json file
// const permissions = JSON.parse(
//     fs.readFileSync(`${__dirname.split('config')[0]}_data/permissions.json`, 'utf-8');
// )

// export const seedPermissions = async (): Promise<void> => {

//     try {

//         const p = await Permission.find({});

//         if(p && p.length > 0) return;

//         const seed = await Permission.create(permissions);

//         if(seed){
//             console.log(colors.green.inverse('Permissions seeded successfully'));
//         }

//     } catch (err) {
//         console.log(colors.red.inverse(`${err}`));
//     }
// }