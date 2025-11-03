import Product from "../models/Product.js"

export const addToCart = async (req, res) => {
    try {
        const {productId} = req.body
        const user = req.user

        const existing = user.cartItems.find(item => item.id === productId)
        if(existing) {
            existing.quantity += 1
        } else {
            user.cartItems.push(productId)
        }

        await user.save()   
        res.status(200).json(user.cartItems)
    } catch (error) {
        console.log("error in add to cart controller", error.message);
        res.status(500).json({message:'server error', error: error.message})   
    }
}

export const removeAllFromCart = async (req, res) => {
    try {
        const {productId} = req.body
        const user = req.user

        if(!productId) {
            user.cartItems = []
        } else {
            user.cartItems = user.cartItems.filter((item) => item.id !== productId)
        }

        await user.save()
        res.status(200).json(user.cartItems)
    } catch (error) {
        console.log("error in remove all from controller", error.message);
        res.status(500).json({message:'server error', error: error.message})  
    }
}

export const updateQuantity = async (req, res) => {
    try {
        const {id:productId} = req.params
        const {quantity} = req.body
        const user = req.user

        const existingItem = user.cartItems.find((item) => item.id === productId)

        if (existingItem) {
            if(quantity === 0) {
                user.cartItems = user.cartItems.filter((item) => item.id !== productId)
                await user.save()
                return res.status(200).json(user.cartItems)
            }

            user.cartItems.quantity = quantity
            await user.save()
            res.status(200).json(user.cartItems)
        } else{
            return res.status(401).json({message:"product not found"})
        }
    } catch (error) {
        console.log("error in update quantity controller", error.message);
        res.status(500).json({message:'server error', error: error.message})  
    }
}

export const getCartProducts = async (req, res) => {
	try {
		const products = await Product.find({ _id: { $in: req.user.cartItems } });

		// add quantity for each product
		const cartItems = products.map((product) => {
			const item = req.user.cartItems.find((cartItem) => cartItem.id === product.id);
			return { ...product.toJSON(), quantity: item.quantity };
		});

		res.json(cartItems);
	} catch (error) {
		console.log("Error in getCartProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};