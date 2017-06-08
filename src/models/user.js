import bcrypt from 'bcrypt';

export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      login: {
        type: DataTypes.STRING,
        unique: true,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      password: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        // allowNull: false,
        validate: {
          isEmail: true,
          // notEmpty: false,
        },
      },
    },
    {
      validate: {
        notAnonymous() {
          if (this.login === null && this.password === null && this.email === null) {
            throw new Error('User cannot be anonymous');
          }
        },
      },

      paranoid: true,
      timestamps: true,
      freezeTableName: true,

      getterMethods: {
        userData() {
          return {
            id: this.id,
            login: this.login,
            email: this.email,
            isAdmin: this.isAdmin,
          };
        },
      },

      hooks: {
        beforeCreate: user => {
          const salt = bcrypt.genSaltSync();
          user.password = bcrypt.hashSync(user.password, salt);
        },
        beforeUpdate: user => {
          if (user.password !== undefined) {
            const salt = bcrypt.genSaltSync();
            user.password = bcrypt.hashSync(user.password, salt);
          }
        },
      },
      instanceMethods: {
        comparePassword: function(candidatePassword) {
          if (undefined !== candidatePassword) {
            const user = this;
            return bcrypt.compareSync(candidatePassword, user.get('password'));
          }
          return false;
        },
      },
      classMethods: {
        generateHash: password => bcrypt.hashSync(password, bcrypt.genSaltSync(), null),
        validPassword: password => bcrypt.compareSync(password, this.password),
      },
    },
  );

  User.beforeBulkCreate(users => {
    users.forEach(user => {
      const salt = bcrypt.genSaltSync();
      user.password = bcrypt.hashSync(user.password, salt);
    });
  });

  return User;
};
