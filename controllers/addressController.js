
const Address = require('../models/addressModel')
const { ObjectId } = require('mongodb')

// add address
const addressload = async (req, res, next) => {
    try {
         const user = req.session.userData
        // const address = req.session.addressId
        const addressData = await Address.findOne({ user })
        console.log(addressData);
        res.render('user/manageaddress',{address:addressData})
    } catch (error) {
        console.log(error);
        next(error)
    }
}
const newaddress = async (req, res) => {
    try {
        res.render('user/addresspage')

    } catch (error) {
        console.log(error);

    }
}

const addAddress = async (req, res) => {
    try {
        const user = req.session.userData
        // console.log(user);
        const userFound = await Address.findOne({ user })
        //console.log(userFound)
        const { fname, lname, phone, address, place, pincode, city, state, email, additionalinfo,addresstype } = req.body;
        if (!userFound) {
            console.log("user not found");
            const newAddress = await new Address({
                user,
                address: [{
                    fname,
                    lname,
                    phone,
                    email,
                    additionalinfo,
                    address,
                    place,
                    pincode,
                    city,
                    state,
                    addresstype
                }]
            })
            await newAddress.save()
            console.log("data saved");
        }
        else {
            console.log("userfound");
            await Address.updateOne({ user }, {
                $push: { address: { fname, lname, phone, address, place, pincode, city, state, email, additionalinfo,addresstype } }
            })
            console.log("data pushed");
        }
        res.redirect('/manageaddress')

    } catch (error) {
        console.log(error);
    }
}


//delete address -profile side side
const deleteAddress = async (req, res, next) => {
    try {
        const user = req.session.userData
        
        const id = new ObjectId(req.params.id);
        console.log(id);
        await Address.findOneAndUpdate({ user, 'address._id': id }, { $pull: { address: { _id: id } } })
        // res.redirect('/manageaddress')
        console.log("pulled");
    } catch (error) {
        console.log(error);
        next(error)
    }
}
const editAddress=async(req,res,next)=>{
    try{
        const user=req.session.userData
        const id=new ObjectId(req.params.id)
        const address=await Address.findOne({ user, 'address._id': id })
        res.render('user/editAddress',{address:address})

    }catch (error) {
        console.log(error);
        next(error)
    }
}
const updateAddress=async(req,res,next)=>{
    try{
        const editedAddress= new ObjectId(req.params.id)
        console.log(req.body.address)
        const address = await Address.updateOne(
            { _id: editedAddress },
            {
              $set: {
                fname:req.body.fname,
                lname:req.body.lname,
                phone:req.body.phone,
                email:req.body.email,
                additionalinfo:req.body.additionalinfo,
                // address:req.body.address,
                place:req.body.place,
                pincode:req.body.pincode,
                addresstype:req.body.addresstype
              }
            })
            res.redirect('/manageaddress')
    }catch (error) {
        console.log(error);
        next(error)
    }
}




module.exports = {
    addressload,
    addAddress,
    deleteAddress,
    newaddress,
    editAddress,
    updateAddress
}