'use strict'

const log = require('debug')('boot:users')

module.exports = function (app) {
  log('should create users')

  const User = app.models.User
  const Role = app.models.Role
  const RoleMapping = app.models.RoleMapping

  const users = []
  const roles = [
    {
      name: 'admin',
      users: [
        {
          username: 'admin',
          password: '1234',
          email: 'admin@admin'
        }
      ]
    },
    {
      name: 'test',
      users: [
        {
          username: 'test',
          password: 'test',
          email: 'test@test'
        }
      ]
    }
  ]

  roles.map((role) => {
    Role.findOrCreate({ where: { name: role.name } }, { name: role.name }, (err, createdRole, wasCreated) => {
      if (err) {
        console.error('error running findOrCreate for', role.name, err)
      }

      wasCreated ? log('created role', createdRole.name) : log('found role', createdRole.name)

      role.users.map((roleUser) => {
        User.findOrCreate({ where: { username: roleUser.username } }, roleUser, (err, createdUser, wasCreated) => {
          if (err) {
            console.error('error running findOrCreate', createdUser.username, err)
          }

          wasCreated ? log('created user', createdUser.username) : log('found user', createdUser.username)

          createdRole.principals.create({
            principalType: RoleMapping.USER,
            principalId: createdUser.id
          }, (err, rolePrincipal) => {
            if (err) {
              console.error('error creating rolePrincipal', err)
            }

            users.push(createdUser)
          })
        })
      })
    })
  })
}
