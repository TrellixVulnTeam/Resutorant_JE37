const Restaurant = require("../models/Restaurants");
//const Users = require("../models/Users");
const restaurantsCtrl = {};

restaurantsCtrl.renderRestaurantForm = (req, res) => {
  res.render("restaurants/new_restaurant");
};
restaurantsCtrl.renderRestaurants = async (req, res) => {
  const restaurants = await Restaurant.find().sort({ date: "desc" }).lean();
  res.render("restaurants/restaurants", { restaurants });
};

restaurantsCtrl.createRestaurant = async (req, res) => {
  const { name, location, speciality, score, latitud, longitud } = req.body;
  const errors = [];
  if (!name) {
    errors.push({ text: "Please Write a name." });
  }
  if (!speciality) {
    errors.push({ text: "Please Write a speciality" });
  }
  if (!location) {
    errors.push({ text: "Please Write a location" });
  }
  if (!score) {
    errors.push({ text: "Please Write a score" });
  }
  if (!latitud) {
    errors.push({ text: "Please Write a latitud" });
  }
  if (!longitud) {
    errors.push({ text: "Please Write a longitud" });
  }
  if (errors.length > 0) {
    res.render("restaurant/new_restaurant", {
      errors,
      name,
      location,
      speciality,
      score,
      latitud,
      longitud,
    });
  } else {
    const newRestaurant = new Restaurant({
      name,
      location,
      speciality,
      score,
      latitud,
      longitud,
    });
    newRestaurant.user = req.user.id;
    await newRestaurant.save();
    req.flash("success_msg", "Restaurant Added Successfully");
    res.redirect("/restaurant/myRestaurants");
  }
};

restaurantsCtrl.renderRestaurantsbyUser = async (req, res) => {
  const restaurants = await Restaurant.find({ user: req.user.id })
    .sort({ date: "desc" })
    .lean();
  res.render("restaurants/all_restaurants", { restaurants });
};

restaurantsCtrl.renderEditRestaurant = async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id).lean();
  if (restaurant.user != req.user.id) {
    req.flash("error_msg", "Not Authorized");
    return res.redirect("/restaurant/myRestaurants");
  }
  res.render("restaurants/edit_restaurant", { restaurant });
};

restaurantsCtrl.filter = async (req, res) => {
  const latitudUser = req.user.latitud;
  const longitudUser = req.user.longitud;
  const restaurants = await Restaurant.find().lean();
  const latidudRestaurant = restaurants.map((restaurant) => restaurant.latitud);
  const longitudRestaurant = restaurants.map((restaurant) => restaurant.longitud);
  console.log(latidudRestaurant);
  console.log(longitudRestaurant);
  for (var i = 0; i < latidudRestaurant.length; i++) {
    for (var j = 0; j < longitudRestaurant.length; j++) {
      if (req.body.distancia1) {
        var distancia =
          getKilometros(
            latitudUser,
            longitudUser,
            latidudRestaurant[i],
            longitudRestaurant[j]
          );
      }
    }
    console.log(distancia);
  }

  

  res.render("restaurants/restaurants", {
    restaurants: await Restaurant.find({
      speciality: req.body.speciality,
      score: req.body.score,
    }).lean(),
  });
};

restaurantsCtrl.updateRestaurant = async (req, res) => {
  const { name, location, speciality } = req.body;
  await Restaurant.findByIdAndUpdate(req.params.id, {
    name,
    location,
    speciality,
  });
  req.flash("success_msg", "Restaurant Updated Successfully");
  res.redirect("/restaurant/myRestaurants");
};
restaurantsCtrl.deleteRestaurant = async (req, res) => {
  await Restaurant.findByIdAndDelete(req.params.id);
  req.flash("success_msg", "Restaurant Deleted Successfully");
  res.redirect("/restaurant/myRestaurants");
};

//funcion para calcular la distancia
getKilometros = function (lat1, lon1, lat2, lon2) {
  rad = function (x) {
    return (x * Math.PI) / 180;
  };
  var R = 6378.137; //Radio de la tierra en km
  var dLat = rad((lat2) - (lat1));
  var dLong = rad((lon2) - (lon1));
  var a =
    Math.sin((dLat) / 2) * Math.sin((dLat) / 2) +
    Math.cos(rad(lat1)) *
      Math.cos(rad(lat2)) *
      Math.sin((dLong) / 2) *
      Math.sin((dLong) / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d.toFixed(2); //Retorna tres decimales
};
module.exports = restaurantsCtrl;
