const axios = require("axios");
const mysql = require("../models/mysqlConnect");
const { isEmpty } = require("../utils");
const CHAPA_URL = process.env.CHAPA_URL || "https://api.chapa.co/v1/transaction/initialize";
const CHAPA_AUTH = process.env.CHAPA_AUTH; // || register to chapa and get the key
const request = require("request");
var sha512 = require("js-sha512");
const { getCurrentFormatedDate } = require("../utils");
const { MerchantId, privateKey } = require("../config");

exports.cardCheckout = async (total, params) => {
  return new Promise((resolve, reject) => {
    let { name, description, cvv, cardNumber } = params;
    const formData = {
      amount: {
        currency: "NGN",
        total: total,
      },
      bankcard: {
        cardHolderName: "DAVID",
        cardNumber: cardNumber,
        cvv: cvv,
        enable3DS: true,
        expiryMonth: "02",
        expiryYear: "26",
      },
      callbackUrl: "https://your-call-back-url.com",
      country: "NG",
      payMethod: "BankCard",
      product: {
        description: "description",
        name: "name",
      },
      reference: "0412346546233989101",
      returnUrl: "https://your-return-url.com",
    };
  
    var hash = sha512.hmac.create(privateKey);
    hash.update(JSON.stringify(formData));
    hmacsignature = hash.hex();
    console.log(hmacsignature);
    request(
      {
        url: "https://testapi.opaycheckout.com/api/v1/international/payment/create",
        method: "POST",
        headers: {
          MerchantId: MerchantId,
          Authorization: "Bearer " + hmacsignature,
        },
        json: true,
        body: formData,
      },
      function (error, response, body) {
        if(error) {
          reject(error);
        }else{
          console.log("card_body:", body);
          resolve(body)
        }
      }
    );
  })
};

exports.bankCheckout = async (total, params) => {
  return new Promise((resolve, reject) => {
    let { name, description, phoneNumber } = params;
    const formData = {
      amount: {
        currency: "NGN",
        total: total,
      },
      callbackUrl: "https://testapi.opaycheckout.com/api/v1/international/print",
      country: "NG",
      customerName: "customerName",
      payMethod: "BankTransfer",
      product: {
        description: description,
        name: name,
      },
      reference: "1232342546342456",
      userPhone: phoneNumber,
    };
  
    var hash = sha512.hmac.create(privateKey);
    hash.update(JSON.stringify(formData));
    hmacsignature = hash.hex();
    console.log(hmacsignature);
    request(
      {
        url: "https://testapi.opaycheckout.com/api/v1/international/payment/create",
        method: "POST",
        headers: {
          MerchantId: MerchantId,
          Authorization: "Bearer " + hmacsignature,
        },
        json: true,
        body: formData,
      },
      function (error, response, body) {
        if(error) {
          reject(error)
        } else{
          resolve(body);
          console.log("body:", body);
        }
      }
    );
  })
};

exports.order = async (req, res) => {
  try{
    console.log("orderbody:", req.body)
    let { items, totalAmount, shipping, schedule_date, user_id, opayInfo, option } = req.body;
    console.log("items: ", totalAmount, shipping, schedule_date, user_id, option);
  
    let newOrder = { user_id, shipping, totalAmount, option };
    if (!isEmpty(schedule_date)) newOrder.schedule_date = schedule_date;
    newOrder.created_at = getCurrentFormatedDate();
  
    if (!isEmpty(opayInfo)) {
      console.log("opayInfo:", opayInfo);
      let orderResult;
      if (!isEmpty(opayInfo.cvv)) {
        orderResult = await this.cardCheckout(totalAmount, opayInfo);
        console.log("orderResult: ", orderResult);
      } else {
        orderResult = await this.bankCheckout(totalAmount, opayInfo);
        console.log("orderResult: ", orderResult);
      }
      if(orderResult.code !== "00000"){
        return res.json({
          status: 0,
          message:"Please try again later"
        })
      }
    }
    mysql.insertOne('tbl_orders', newOrder).then(oresult => {
      console.log("oresult", oresult);
      let insertQuery = '';
      let deleteQuery = '';
      items && items.forEach(item => {
        insertQuery += mysql.getInsertQuery('tbl_orderdetails', {order_id: oresult.id, user_id: user_id, product_id: item.product_id, cat_id: item.cat_id,size: item.size, quantity: item.quantity });
        deleteQuery += mysql.deleteManyQuery("tbl_cart", {user_id: user_id, product_id: item.product_id});
      })
      let pendingSql = `SELECT * FROM tbl_orders WHERE user_id = '${user_id}' and status != 4 and deleted_at is NULL`;
      console.log("pending_sql", pendingSql);
      console.log("===sql:", insertQuery, deleteQuery, pendingSql);
      mysql.query(`${insertQuery}${deleteQuery}${pendingSql}`).then(result => {
        console.log("result:", result[2]);
        let list = result[2];
        return res.json({
          status: 0,
          message: "Successfully ordered",
          list
        })
      }).catch(err => {
        console.log("ordered", err);
        return res.json({
          status: 1,
          message: "Please try again later"
        })
      })
    })
  }
  catch(err){
    console.log("payment error:", err);
    return res.json({
      status: 1,
      message: "Please try again later"
    })
  }
};
