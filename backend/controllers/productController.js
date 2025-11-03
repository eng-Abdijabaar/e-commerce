import Product from "../models/Product.js"
import cloudinary from "../lib/cloudinary.js"
import { redis } from "../lib/redis.js"

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({})
        res.status(200).json({ products })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error", error: error.message })
    }
}

export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featred_products")
        if (featuredProducts) {
            return res.status(200).json(JSON.parse(featuredProducts))
        }

        // if not in cache
        // .lean() returns a plain JS object instead of Mongoose document 
        // which makes it faster and uses less memory
        featuredProducts = await Product.find({ isFeatured: true }).lean()

        if (!featuredProducts) {
            return res.status(404).json({ message: "No featured products found" })
        }

        // store in cache for quick access in next time
        await redis.set("featred_products", JSON.stringify(featuredProducts))
        res.status(200).json({ featuredProducts })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error", error: error.message })
    }
}

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, category } = req.body

        // upload image to cloudinary
        let cloudinaryResponse = null
        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" })
        }

        // create product
        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
            category
        })

        res.status(201).json({ product })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error", error: error.message })

    }
}

export const deleteProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		if (product.image) {
			const publicId = product.image.split("/").pop().split(".")[0];
			try {
				await cloudinary.uploader.destroy(`products/${publicId}`);
				console.log("deleted image from cloduinary");
			} catch (error) {
				console.log("error deleting image from cloduinary", error);
			}
		}

		await Product.findByIdAndDelete(req.params.id);

		res.json({ message: "Product deleted successfully" });
	} catch (error) {
		console.log("Error in deleteProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $sample: { size: 3}
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    image: 1,
                    price: 1,
                }
            }
        ])
        res.status(200).json({ products })
    } catch (error) {
        console.log('error in getRecommendedProducts controller',error);
        res.status(500).json({ message: "Server Error", error: error.message })
    }
}

export const getProductsByCategory = async (req, res) => {
	const { category } = req.params;
	try {
		const products = await Product.find({ category });
		res.json({ products });
	} catch (error) {
		console.log("Error in getProductsByCategory controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const toggleFeaturedProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (product) {
			product.isFeatured = !product.isFeatured;
			const updatedProduct = await product.save();
			await updatefeaturedProductsCache();
			res.json(updatedProduct);
		} else {
			res.status(404).json({ message: "Product not found" });
		}
	} catch (error) {
		console.log("Error in toggleFeaturedProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

async function updatefeaturedProductsCache() {
    try {
        //the lean method is used to return plain javaScript objects instead of full mongoose documents.
        // This can improve performance and reduce memory usage, especially 
        // when dealing with large datasets or when you don't need the additional functionality provided by mongoose documents.
        const featuredProducts = await Product.find({isFeatured: true}).lean()
        await redis.set("featured_products", JSON.stringify(featuredProducts))
    } catch (error) {
        console.log("Error updating featured products cache function", error);
    }
}