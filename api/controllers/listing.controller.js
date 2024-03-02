import Listing from "../models/listing.model.js";

export const createListing = async (request, response, next) => {
  try {
    const listing = await Listing.create(request.body);
    return response.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async(request,response,next)=>{
  
    const listing = await Listing.findById(request.params.id);
    if(!listing){
      return response.status(404).json("Listing not found")
    }
    if(request.user.id !== listing.userRef){
      return response.status(401).json("You are not authorized to delete this listing")
    }
    try {
      await Listing.findByIdAndDelete(request.params.id);
      response.status(200).json("Listing deleted successfully");
    } catch (error) {
      next(error);
    }
}

export const updateListing = async(request,response,next)=>{
  try{
    const listing = await Listing.findById(request.params.id);
    if(!listing){
      return response.status(404).json("Listing not found")
    }
    if (request.user.id !== listing.userRef) {
      return response
        .status(401)
        .json("You are not authorized to delete this listing");
    }
    const updatedListing = await Listing.findByIdAndUpdate(request.params.id,request.body,{new:true});
    response.status(200).json(updatedListing);
  }catch(error){
    next(error);
  }
}

export const getListing = async(request,response,next)=>{
  try{
    const listing = await Listing.findById(request.params.id);
    if(!listing){
      return response.status(404).json("Listing not found")
    }
    response.status(200).json(listing);
  }catch(error){
    next(error);
  }
}
