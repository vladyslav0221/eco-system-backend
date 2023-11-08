const mysql = require('./mysqlConnect');

exports.findByCouponHistory = (code, user_id) => {
    return new Promise((resolve, inject) => {
        mysql.query(`select * from tbl_coupon_history where deleted_at is null and coupon_code = '${code}' and user_id=${user_id}`).then(([result]) => {
            resolve(result);
          })
          .catch((err) => {
            inject(err);
          });
    })
}

exports.findByCoupon = (code) => {
  return new Promise((resolve, inject) => {
    let sql = `select * from tbl_coupon where code = '${code}' and deleted_at is null and count >=0`;
    mysql.query(sql).then(([result]) => {
        resolve(result);
      })
      .catch((err) => {
        inject(err);
      });
  });
};

exports.findById = (id) => {
    return new Promise((resolve, inject) => {
        mysql.query(`select * from tbl_coupon where id = '${id}'`).then(([user]) => {
            resolve(user);
        }).catch(err => {
            inject(err);
        })
    })
}

exports.register = (newProduct) => {
    return new Promise((resolve, reject) => {
        mysql.insertOne('tbl_coupon', newProduct).then(product => {
            resolve(product)
        }).catch(err => {
            reject(err);
        });
    });
}