// libraries
var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var jsSchema = require('js-schema');
var generatePsswrd = require('password-generator');
var vCard = require('vcf');

var Mailer = require(ROOT + '/app/helpers/mailer');

// classes
var Controller = require(ROOT + '/app/controllers/base_controller');

// instances
var controller = new Controller();

const db = require(BACKEND + '/models');
const uuidV4 = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

var AddressModel = db.address;
var AssignmentModel = db.employee_assignment;
var EmployeeModel = db.employee;
var PhoneModel = db.phone_number;
var SettingModel = db.setting;
var OrganizationModel = db.organization;
var OrganizationUnitModel = db.organization_units;

controller.createOne = (req, res, next) => {
    var user = req.user || {};

    var record = options = address = phone ={};

    record.email = req.body.email;
    record.first_name = req.body.first_name;
    record.last_name = req.body.last_name;
    record.gender = req.body.gender;
    record.dob = req.body.dob;
    record.other_details = req.body.other_details;
    record.password = generatePsswrd();

    if (req.body.address) {
        address = req.body.address
    }

    if (req.body.phone) {
        phone.phone_number = req.body.phone;
    }

    EmployeeModel
        .findOrCreate({
            where: { email: record.email },
            defaults: record,
            attributes: ['employee_id', 'email', 'last_name', 'first_name'],
            include: [AddressModel, PhoneModel]
        })
        .spread((employee, created) => {
            console.log(employee);

            async.parallel({
                assign: function(callback) {
                    AssignmentModel
                        .create()
                        .then(assign => {
                            employee.setAssignment(assign.date_from)
                        })
                        .catch(err => {
                            cb(err.errors)
                        })
                },
                address: function(callback) {
                    AddressModel
                        .create(address)
                        .then(address => {
                            employee.setAddress(address.address_id);
                        })
                        .catch(err => {
                            cb(err.errors)
                        })
                },
                phone: function(callback) {     
                    PhoneModel
                        .create({
                            phone_number: chance.phone({ formatted: false })
                        })
                        .then(phone => {
                            employee.setPhone( phone.phone_number_id);
                        })
                },
                setting: function(callback) {     
                    SettingModel
                        .create()
                        .then(setting => {
                            employee.setSetting( employee.employee_id);
                        })
                }
            }, function(err, results) {
                // results is now equals to: {one: 1, two: 2}
                console.log(results);

                if(err) {

                }

                var mailerOptions = {
                    from: 'hr@denadis.com',
                    to: employee.email,
                    subject: 'Welcome to the Family', 
                    html: '<h1>Welcome to the team</h1><p>Here is yoour temporay password.</p>'
                }

                Mailer.send();

                res.status(201)
                res.json({
                    result: employee.get({plain: true})
                })
            });
        });
};

controller.readOne = (req, res, next) => {

    var user = req.user || {};

    var id = req.query.id;

    // validate the parameters
    var schema = jsSchema({
        id: uuidV4,
    });

    var invalid = schema.errors({
        id: id
    });

    if (invalid) {
        
        // res.nnBunyan(errors);
        console.log(nnLine, new Date());
        res.status(400);
        res.json({
            errors: invalid,
        });
        return;

    }

    EmployeeModel
        .findById(id)
        .then((user) => {
            res.json({
                result: user.toJSON()
            });
            return;
        }).catch((err) => {
            res.status(404);
            res.json({
                errors: err,
            });
            return;
        });
};

controller.readMany = (req, res, next) => {
    var user = req.user || {};
    var populate = req.body.populate || [];
    var orderBy = req.query.orderBy;
    var limit = req.query.limit || 10;
    var offset = req.query.offset || 0;

    EmployeeModel
        .findAndCountAll({
            subQuery: false,
            include: populate,
            order: orderBy,
            limit: limit,
            offset: offset,
        })
        .then(sheets => {
            sheets = sheets.rows.map(obj => {
                obj.name = obj.getFullName();
                console.log(obj)
                return obj;
            });
            // console.log(sheets);
            res.json({
                result: sheets
            });
            return;
        })
        .catch(err => {
            res.status(500);
            res.json({
                errors: err
            });
            return;
        })
};

controller.updateOne = (req, res, next) => {

    var user = req.user || {};
    var id = req.query.id

    // validate the parameters
    var schema = jsSchema({
        id: Number,
    });

    var invalid = schema.errors({
        id: id
    });

    if (invalid) {

        var errors = ['NNC-01001'];
        // res.nnBunyan(errors);
        console.log(nnLine, new Date());
        res.status(400);
        res.json({
            errors: invalid,
        });
        return;

    }

    var record = {};

    EmployeeModel
        .update(record,{
            where: {
                employee_id: id
            },
            returning: true,
            paranoid: true,
            plain: true
        })
        .then((user) => {
            console.log(user);
            res.json({
                result: user
            });
            return;
        })
        .catch(err => {
            res.status(500);
            res.json({
                errors: err
            });
            return;
        });
};

controller.assignnment = (req, res, next) => {
    
};

controller.addProfilePic = (req, res, next) => {
    var user = req.user || {};
};

controller.addAddress = (req, res, next) => {

    var user = req.user || {};


    var record = {};

    AddressModel
        .create(record,{
            returning: true,
            paranoid: true,
            plain: true
        })
        .spread((address, created) => {
            console.log(address.get({plain: true}))
            console.log(created);
            res.json({
                result: address
            });
            return;
        })
};

controller.addPhoneNumber = (req, res, next) => {

    var user = req.user || {};

    var record = {};

    record.phone_number = user._id;

    PhoneModel
        .create(record,{
            returning: true,
            paranoid: true,
            plain: true
        })
        .spread((phone, created) => {
            console.log(phone.get({plain: true}))
            console.log(created)
            res.json({
                result: phone
            });
            return;
        })
};

controller.updateAddress = (req, res, next) => {

    var user = req.user || {};
    var record = {},
    recordId;

    // record.address_line_1 = ;

    AddressModel
        .update(record, {
            where: {
                address_id: recordId,
                employee_id: user._id
            },
            returning: true,
            paranoid: true,
            plain: true
        })
        .then((address) => {
            console.log(address);
            res.json({
                result: address
            });
            return;
        })
        .catch(err => {
            res.status(500);
            res.json({
                errors: err
            });
            return;
        });
};

controller.updatePhoneNumber = (req, res, next) => {

    var user = req.user || {};
    var record = {},
    recordId;

    // record.phone_number = ;

    PhoneModel
        .update(record, {
            where: {
                phone_number_id: recordId,
                employee_id: user._id
            },
            returning: true,
            paranoid: true,
            plain: true
        })
        .then((phone) => {
            console.log(phone)
            res.json({
                result: phone
            });
            return;
        })
        .catch(err => {
            res.status(500);
            res.json({
                errors: err
            });
            return;
        })
};

controller.removeAddress = (req, res, next) => {

    var user = req.user || {};
    var record = {}, recordId;

    record.where = {
        address_id: recordId,
        employee_id: user._id
    }

    AddressModel
        .destory(record)
        .then(result => {
            res.status(204);
            return;
        })
        .catch(err => {
            res.status(500);
            res.json({
                errors: err
            });
            return;
        })
};

controller.removePhoneNumber = (req, res, next) => {

    var user = req.user || {};
    var record = {}, recordId;

    record.where = {
        phone_number_id: recordId,
        employee_id: id
    }

    PhoneModel
        .destory(record)
        .then(result => {
            res.status(204);
            return;
        })
        .catch(err => {
            res.status(500);
            res.json({
                errors: err
            });
            return;
        })
};

controller.deleteOne = (req, res, next) => {
    var user = req.user || {};
    var id = req.params.id;

    // TODO: need to make sure certain people are allowed to do this
    // async.series()

    var record = {};

    record.where = {
        employee_id: id
    }

    EmployeeModel
        .destory(record)
        .then(result => {
            res.status(204);
            return;
        })
        .catch(err => {
            res.status(500);
            res.json({
                errors: err
            });
            return;
        })
};

controller.generateQRCode = (req, res, next) => {
    var user = req.user || {};

    var id = req.query.id;

    // validate the parameters
    var schema = jsSchema({
        id: uuidV4,
    });

    var invalid = schema.errors({
        id: id
    });

    if (invalid) {
        
        // res.nnBunyan(errors);
        console.log(nnLine, new Date());
        res.status(400);
        res.json({
            errors: invalid,
        });
        return;

    }

    EmployeeModel
        .findById(id)
        .then((employee) => {
            vCard.add()
            res.status(201);
            res.json({
                result: "Card was created",
            });
            return;
        }).catch((err) => {
            res.status(404);
            res.json({
                errors: err,
            });
            return;
        });
}

// controller.before([
//     '*'
// ], (req, res, next) => {

//     if (!req.isAuthenticated() || !req.user.isManager()) {
//         res.status(401);
//         res.json({
//             errors: 'UNAUTHORIZED'
//         });
//         return;
//     }

//     next();

// });

// controller.before([
//     'generateQRCode'
// ], (req, res, next) => {

//     if (!req.isAuthenticated() || !req.user.isManager()) {
//         res.status(401);
//         res.json({
//             errors: 'UNAUTHORIZED'
//         });
//         return;
//     }

//     next();

// });

module.exports = controller;