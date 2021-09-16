const fs = require('fs');
const path = require('path');
const directory = '../commands';

const getCommands = async () => {
  let groups = [];

  fs.readdirSync(path.join(__dirname, directory)).forEach(dir => {
    const directories = fs.readdirSync(path.join(__dirname, directory, dir)).filter(command => command.endsWith('.js'));

    const value = [];

    const commands = directories.map(file => {
      const command = require(path.join(__dirname, directory, dir, file));

      let permissionsArray = [];

      if (command.permissions) {
        command.permissions.forEach(permission => {
          const permissionString = permission.split('_').join(' ');

          permissionsArray.push(permissionString);
        });
      };

      value.push({
        name: typeof command.commands === 'string' ? command.commands : command.commands[0],
        description: command.description ? command.description : 'No description',
        aliases: typeof command.commands === 'object' ? command.commands.slice(1).join(', ') : 'No aliases',
        arguments: command.expectedArgs ? command.expectedArgs : '',
        permissions: command.permissions ? permissionsArray.join(', ') : 'No permissions required', 
      });
    });

    let data = new Object();

    data = {
      group: dir.toUpperCase(),
      cmds: value,
    };

    groups.push(data);
  });

  return groups;

  // let groups = [];

  // fs.readdirSync(path.join(__dirname, directory)).forEach(dir => {
  //   const directories = fs.readdirSync(path.join(__dirname, directory, dir));

  //   const commands = directories.forEach(command => {
      
  //   })
  // });

  // return groups;
};

module.exports = {
  getCommands,
};