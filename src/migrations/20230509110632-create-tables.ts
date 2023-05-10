'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async transaction => {
    await queryInterface.createTable('Profiles', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      profession: {
        type: Sequelize.STRING,
        allowNull: false
      },
      balance: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('client', 'contractor'),
        allowNull: false
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    }, { transaction });

    await queryInterface.createTable('Contracts', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      terms: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      ClientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Profiles',
          key: 'id'
        }
      },
      ContractorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Profiles',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.ENUM('new', 'in_progress', 'terminated'),
        allowNull: false
      }
    }, { transaction });

    // Index this because it's a foreign key
    await queryInterface.addIndex('Contracts', {
      unique: false,
      using: 'HASH',
      fields: ['ClientId'],
      name: 'contracts_client_id',
      transaction
    });

    await queryInterface.addIndex('Contracts', {
      unique: false,
      using: 'HASH',
      fields: ['ContractorId'],
      name: 'contracts_contractor_id',
      transaction
    });

    await queryInterface.createTable('Jobs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      paid: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      ContractId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Contracts',
          key: 'id'
        }
      }
    }, { transaction });

    // Index this because it's a foreign key
    await queryInterface.addIndex('Jobs', {
      unique: false,
      using: 'HASH',
      fields: ['ContractId'],
      name: 'jobs_contract_id',
      transaction
    });
  }),
  down: queryInterface => queryInterface.sequelize.transaction(async transaction => {
    // We don't need to delete indexes manually like below because
    // DROP TABLE always removes any indexes, rules, triggers,
    // and constraints that exist for the target table

    await queryInterface.dropTable('Jobs', { transaction });
    await queryInterface.dropTable('Contracts', { transaction });
    await queryInterface.dropTable('Profiles', { transaction });
  })
};
