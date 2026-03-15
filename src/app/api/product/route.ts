import { NextRequest, NextResponse } from "next/server";
import db, { Product, Image } from "@/lib/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const { name, clothType, gender, price, imageUrls } = await req.json();
    // console.log("Incoming data:", {
    //   name,
    //   clothType,
    //   gender,
    //   price,
    //   imageUrls,
    // });

    // Insert the product into the database
    const [product] = await db
      .insert(Product)
      .values({ name, clothType, gender, price })
      .returning();
    // console.log("Inserted product:", product);
    // Insert the image URLs into the database
    await db.insert(Image).values(
      imageUrls.map((url: string) => ({
        productId: product.id,
        imageUrl: url,
      })),
    );

    return NextResponse.json({ product, images: imageUrls });
  } catch (error) {
    console.log("Error uploading product:", error);
    return new NextResponse("Database error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const gender = searchParams.get("gender");

    let products;

    if (id) {
      // Retrieve a single product by ID
      products = await db
        .select()
        .from(Product)
        .where(eq(Product.id, Number(id)));
    } else if (gender) {
      // Retrieve products by gender
      products = await db
        .select()
        .from(Product)
        .where(eq(Product.gender, gender));
    } else {
      // Retrieve all products
      products = await db.select().from(Product);
    }

    // For each product, retrieve the associated images
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const images = await db
          .select({ imageUrl: Image.imageUrl })
          .from(Image)
          .where(eq(Image.productId, product.id));

        return {
          ...product,
          images: images.map((img) => img.imageUrl),
        };
      }),
    );

    return NextResponse.json({ products: productsWithImages });
  } catch (error) {
    console.error("Error in GET /api/product:", error);
    return new NextResponse("Database error", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  let session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const { name, clothType, gender, price, imageUrls } = await req.json();
    // console.log(req.body);
    // const incomingData = {
    //   name: name,
    //   clothType: clothType,
    //   gender: gender,
    //   price: price,
    //   imageUrls: imageUrls,
    // };
    // console.log("Incoming data:", incomingData);
    // Create an object with only the non-null fields
    const updateData: any = {};
    if (name !== null && name !== undefined) updateData.name = name;
    if (clothType !== null && clothType !== undefined)
      updateData.clothType = clothType;
    if (gender !== null && gender !== undefined) updateData.gender = gender;
    if (price !== null && price !== undefined) updateData.price = price;

    // Update the product with the provided data
    const updatedProduct = await db
      .update(Product)
      .set(updateData)
      .where(eq(Product.id, Number(id)))
      .returning();

    // If imageUrls is provided, update the images as well
    if (
      imageUrls !== null &&
      imageUrls !== undefined &&
      Array.isArray(imageUrls)
    ) {
      // Retrieve existing images for the product
      // console.log("imageUrls", imageUrls);
      const existingImages = await db
        .select({ imageUrl: Image.imageUrl })
        .from(Image)
        .where(eq(Image.productId, Number(id)));

      const existingImageUrls = existingImages.map((img) => img.imageUrl);

      // Find images to add
      const imagesToAdd = imageUrls.filter(
        (url: string) => !existingImageUrls.includes(url),
      );

      // Find images to remove
      const imagesToRemove = existingImageUrls.filter(
        (url: string) => !imageUrls.includes(url),
      );

      // Delete images that are not in the new list
      for (const url of imagesToRemove) {
        await db.delete(Image).where(eq(Image.imageUrl, url));
      }

      // Insert new images
      if (imagesToAdd.length > 0) {
        await db.insert(Image).values(
          imagesToAdd.map((url: string) => ({
            productId: updatedProduct[0].id,
            imageUrl: url,
          })),
        );
        // console.log("Images added:", imagesToAdd);
      }
    }

    console.log("Product updated successfully:");
    return NextResponse.json({ product: updatedProduct[0], images: imageUrls });
  } catch (error) {
    console.error("Error updating product:", error);
    return new NextResponse("Database error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  let session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Delete the product
    await db.delete(Product).where(eq(Product.id, Number(id)));

    // Delete the images associated with the product
    await db.delete(Image).where(eq(Image.productId, Number(id)));

    console.log("Product deleted successfully");
    return new NextResponse("Product deleted successfully");
  } catch (error) {
    console.log("Error deleting product:", error);
    return new NextResponse("Database error", { status: 500 });
  }
}
