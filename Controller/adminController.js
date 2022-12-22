const db = require("../Model/connection");
const fileupload = require("express-fileupload");
const productHelpers = require("../helpers/productHelpers");
const adminHelpers = require("../helpers/adminHelpers");
const session = require("express-session");
const userHelpers = require("../helpers/userHelpers");
const orderHelpers = require("../helpers/orderHelpers");
const { admin } = require("../Model/connection");
const chartHelpers = require("../helpers/chartHelpers");
const couponHelpers=require("../helpers/couponHelpers")
const bannerHelpers=require("../helpers/bannerHelpers")
var voucher_codes = require("voucher-code-generator");
const { response } = require("../app");

module.exports = {
  //Admin IndexPage

  getAdminpanel: function (req, res, next) {
    try {
      if (req.session.adminIn) {
        res.render("admin-index", {
          layout: "admin-layout",
        });
      } else {
        res.redirect("/admin_panel/admin_login");
      }
    } catch (error) {
      console.log(error);
    }
  },

  //Admin Login Management

  // Admin Login Page

  getAdminlogin: (req, res) => {
    try {
      if (req.session.adminIn) {
        res.redirect("/admin_panel");
      } else {
        res.render("admin/admin-login", {
          layout: "admin-layout",
          admin: true,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },

  // Admin Login Post

  postAdminlogin: (req, res) => {
    adminHelpers
      .doAdminlogin(req.body)
      .then((response) => {
        if (response.status) {
          req.session.admin = response.admin._id;
          req.session.adminIn = true;
          res.redirect("/admin_panel");
        } else {
          res.redirect("/admin_panel/admin_login");
        }
      })
      .catch((err) => console.log(err));
  },

  // Admin Logout

  getAdminlogout: (req, res) => {
    try {
      req.session.admin = null;
      req.session.adminIn = false;
      res.clearCookie();
      res.redirect("/admin_panel/admin_login");
    } catch (error) {
      console.log(error);
    }
  },

  /////product Management//////

  // Get Add Product

  getAddproduct: (req, res) => {
    productHelpers
      .getAllcategory()
      .then((category) => {
        res.render("admin/add-product", {
          layout: "admin-layout",
          category,
        });
      })
      .catch((err) => console.log(err));
  },

  // Get Product

  getProducts: (req, res) => {
  
    productHelpers
      .getAllproduct(req.query.page,req.query.limit)
      .then((response) => {
        res.render("admin/productManagement", {
          layout: "admin-layout",
          product:response.product,
          docCount:response.docCount,
          currentPage:req.query.page,     
        });
      })
      .catch((err) => console.log(err));
  },

  // Post Add Product

  postAddproduct: (req, res) => {
    productHelpers
      .addProduct(req.body)
      .then((insertedId) => {
        let name = insertedId;
        req.files?.image?.forEach((element, index) => {
          element.mv(
            "./public/productImages/" + name + index + ".jpg",
            (err, done) => {
              if (!err) {
                console.log("product add");
              } else {
                console.log(err);
              }
            }
          );
        });
        res.redirect("/admin_panel/products/add_product");
      })
      .catch((err) => console.log(err));
  },

  // Delete Product

  deleteProduct: (req, res) => {
    let proId = req.params.id;
    productHelpers
      .deleteProduct(proId)
      .then(() => {
        res.redirect("/admin_panel/products");
      })
      .catch((err) => console.log(err));
  },

  // Edit Product

  editProduct: async(req, res) => {
    let proId = req.params.id;
   let category= await productHelpers.getAllcategory()
    productHelpers
      .getProduct(proId)
      .then((product) => {
        res.render("admin/edit-product", {
          layout: "admin-layout",
          product,
          category,
        });
      })
      .catch((err) => console.log(err));
  },

  // Update Product

  updateProduct: (req, res) => {
    let proId = req.params.id;
    let body = req.body;
    productHelpers
      .updateProduct(proId, body)
      .then(() => {
        req?.files?.image1?.mv("./public/productImages/" + proId + "0.jpg");
        req?.files?.image2?.mv("./public/productImages/" + proId + "1.jpg");
        req?.files?.image3?.mv("./public/productImages/" + proId + "2.jpg");
        req?.files?.image4?.mv("./public/productImages/" + proId + "3.jpg");
        res.redirect("/admin_panel/products");
      })
      .catch((err) => console.log(err));
  },

  /////user Management/////

  // Get All Users

  getAllusers: (req, res) => {
    userHelpers
      .getAllusers(req.query.page,req.query.limit)
      .then((response) => {
        res.render("admin/userManagement", {
          layout: "admin-layout",
          users:response.user,
          docCount:response.docCount,
          currentPage:req.query.page, 
        });
      })
      .catch((err) => console.log(err));
  },

  // Block Users

  blockUser: (req, res) => {
    let userId = req.params.id;
    userHelpers
      .blockUser(userId)
      .then(() => {
        res.redirect("/admin_panel/users");
      })
      .catch((err) => console.log(err));
  },

  // Unblock Users

  unblockUser: (req, res) => {
    let userId = req.params.id;
    userHelpers
      .unblockUser(userId)
      .then(() => {
        res.redirect("/admin_panel/users");
      })
      .catch((err) => console.log(err));
  },

  /////Category Management/////

  // Get Category

  getCategory: (req, res) => {
    productHelpers
      .getAllcategory()
      .then((category) => {
        res.render("admin/add-category", {
          layout: "admin-layout",
          category,
        });
      })
      .catch((err) => console.log(err));
  },

  // Add Category

  addCategory: (req, res) => {
    productHelpers
      .addCategory(req.body)
      .then((response) => {
        if (response == false) {
          res.send({ value: "error" });
        } else {
          res.send({ value: "good" });
        }
      })
      .catch((err) => console.log(err));
  },

  // Delete Category

  deleteCategory: (req, res) => {
    let catId = req.params.id;
    productHelpers
      .deleteCategory(catId)
      .then(() => {
        res.redirect("/admin_panel/category");
      })
      .catch((err) => console.log(err));
  },

  // Edit Category

  editCategory: (req, res) => {
    let catId = req.params.id;
    productHelpers
      .getCategory(catId)
      .then((category) => {
        res.render("admin/edit-catagory", {
          layout: "admin-layout",
          category,
        });
      })
      .catch((err) => console.log(err));
  },

  // Update Category

  updateCategory: (req, res) => {
    let cate = req.body;
    let cateId = req.params.id;
    productHelpers
      .updateCategory(cate, cateId)
      .then(() => {
        res.redirect("/admin_panel/category");
      })
      .catch((err) => console.log(err));
  },

  // Get Admin Orders //

  getAdminOrders: (req, res) => {
    orderHelpers
      .getAdminOrders(req.session.user._id)
      .then((data) => {
        res.render("admin/order_management", { data, layout: "admin-layout" });
      })
      .catch((err) => console.log(err));
  },

  // Get Admin Orders Detailes //

  getAdminOrdersDetailes: (req, res) => {
    orderHelpers
      .getAdminOrdersDetailes(req.session.user._id,req.params.id)
      .then((data) => {
        res.render("admin/order_detailes", { data, layout: "admin-layout" });
      })
      .catch((err) => console.log(err));
  },

  updateOrder:(req,res)=>{
    console.log("=>",req.body);
    orderHelpers.updateOrder(req.body).then((response)=>{
     res.json(response)
    })
  },

  chartGraph:(req,res)=>{
  chartHelpers.monthWiseSales().then((pricesdata)=>{
    res.json(pricesdata)
  })
},

addCoupon:(req,res)=>{
  console.log("hihi");
  res.render("admin/add- coupon",{ layout: "admin-layout"})
},

getCouponCode: async (req, res) => {
  try {
    let coupenCode = await voucher_codes.generate({
      prefix: 'Evara-',
      length: 5,
      count: 1
    })
    res.send({ coupenCode })
  } catch (error) {
    console.log(error);
  }

},

postAddCoupon:(req,res)=>{
  let obj = {
    coupon: req.body.coupen,
    discountType: req.body.discountType,
    cappedAmount: req.body.cappedAmount,
    amount: req.body.discountAmount,
    amountValidity: req.body.amountValidity,
    percentage: req.body.discountPercentage,
    validity: req.body.validity,
    description: req.body.description,
    redeemTime: req.body.redeemTime
  }
  console.log("hello",obj);
  couponHelpers.addCoupon(obj).then((response)=>{
res.json(response)
  })
},
getCoupon:async(req,res)=>{
  let couponData = await db.coupon.find({})
  res.render('admin/couponManagement',{couponData, layout: "admin-layout"})
},

deleteCoupon:(req,res)=>{
  console.log("delele");
  let copId = req.params.id;
  couponHelpers
    .deleteCoupon(copId)
    .then(() => {
      res.json({status:true});
    })
    .catch((err) => console.log(err));
},

getSalesReportPage:(req,res)=>{

},










bannerManagement:async (req,res)=>{
  let banners=await db.banner.find()
  res.render('admin/bannerManagement',{layout: "admin-layout",banners})
},

addBannerGet:async(req,res)=>{
  let category= await productHelpers.getAllcategory()

  res.render('admin/add-banner',{layout: "admin-layout",category})
},
addBannerPost:(req,res)=>{
bannerHelpers.addBanner(req.body)

  .then((insertedId) => {
    let image=req.files.image
    console.log(image);
    let bannerName = insertedId;
    image.mv(`./public/bannerImages/${bannerName}.jpg`, (err) => {
      if (!err) {
        console.log("add Banner");
       
      } else {
        console.log(err);
      }
    })
    res.redirect("/admin_panel/banner/add_banner");
  })
},

disableBanner:(req,res)=>{
  
  bannerHelpers.disableBanner(req.params.id).then(()=>{
    res.redirect('/admin_panel/banner')
  })
},

enableBanner:(req,res)=>{
  bannerHelpers.enableBanner(req.params.id).then(()=>{
    res.redirect('/admin_panel/banner')
  })
}

};
