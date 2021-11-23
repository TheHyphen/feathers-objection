"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = errorHandler;

var _errors = _interopRequireDefault(require("@feathersjs/errors"));

var _objection = require("objection");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ERROR = Symbol('feathers-knex/error');

function errorHandler(error) {
  const {
    message
  } = error.nativeError || error;
  let feathersError;

  if (error instanceof _errors.default.FeathersError) {
    feathersError = error;
  } else if (error instanceof _objection.ValidationError) {
    switch (error.type) {
      case 'ModelValidation':
        feathersError = new _errors.default.BadRequest(message, error.data);
        break;

      case 'RelationExpression':
        feathersError = new _errors.default.BadRequest('Invalid Relation Expression');
        break;

      case 'UnallowedRelation':
        feathersError = new _errors.default.BadRequest('Unallowed Relation Expression');
        break;

      case 'InvalidGraph':
        feathersError = new _errors.default.BadRequest('Invalid Relation Graph');
        break;

      default:
        feathersError = new _errors.default.BadRequest('Unknown Validation Error');
    }
  } else if (error instanceof _objection.NotFoundError) {
    feathersError = new _errors.default.NotFound(message);
  } else if (error instanceof _objection.UniqueViolationError) {
    if (error.client === 'mysql') {
      feathersError = new _errors.default.Conflict(error.nativeError.sqlMessage, {
        constraint: error.constraint
      });
    } else {
      feathersError = new _errors.default.Conflict(`${error.columns.join(', ')} must be unique`, {
        columns: error.columns,
        table: error.table,
        constraint: error.constraint
      });
    }
  } else if (error instanceof _objection.NotNullViolationError) {
    feathersError = new _errors.default.BadRequest(`${error.column} must not be null`, {
      column: error.column,
      table: error.table
    });
  } else if (error instanceof _objection.ForeignKeyViolationError) {
    feathersError = new _errors.default.Conflict('Foreign Key Violation', {
      table: error.table,
      constraint: error.constraint
    });
  } else if (error instanceof _objection.CheckViolationError) {
    feathersError = new _errors.default.BadRequest('Check Violation', {
      table: error.table,
      constraint: error.constraint
    });
  } else if (error instanceof _objection.ConstraintViolationError) {
    feathersError = new _errors.default.Conflict('Constraint Violation', {
      columns: error.columns,
      table: error.table,
      constraint: error.constraint
    });
  } else if (error instanceof _objection.DataError) {
    feathersError = new _errors.default.BadRequest('Invalid Data');
  } else if (error instanceof _objection.DBError) {
    feathersError = new _errors.default.GeneralError('Unknown Database Error');
  } else {
    feathersError = new _errors.default.GeneralError(message);
  }

  feathersError[ERROR] = error;
  throw feathersError;
}

errorHandler.ERROR = ERROR;
module.exports = exports.default;