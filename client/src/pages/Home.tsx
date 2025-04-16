import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const Home = () => {
  const [, navigate] = useLocation();

  return (
    <div className="bg-[#f9f9f9]">
      {/* Hero Section */}
      <section className="bg-primary py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <div className="md:grid md:grid-cols-2 md:gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4 leading-tight">
                Fresh Produce at <br className="hidden md:block" />
                Wholesale Prices
              </h1>
              <p className="text-lg text-white/90 mb-8 max-w-lg">
                Order fresh fruits and vegetables in bulk directly from farms to your doorstep. Perfect for restaurants, businesses, and large households.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-neutral-100 text-lg px-8"
                  onClick={() => navigate("/products")}
                >
                  Browse Products
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 text-lg px-8"
                  onClick={() => navigate("/place-order")}
                >
                  Place Order
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white p-4 rounded-lg shadow-xl transform rotate-3 mt-8">
                <img
                  src="https://images.unsplash.com/photo-1573246123716-6b1782bfc499?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80"
                  alt="Fresh Produce"
                  className="rounded w-full h-auto"
                />
              </div>
              <div className="bg-white p-4 rounded-lg shadow-xl transform -rotate-2 -mt-40 ml-24">
                <img
                  src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80"
                  alt="Vegetables"
                  className="rounded w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-neutral-800 mb-4">Why Choose FreshBulk?</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              We connect farmers directly with businesses and consumers, ensuring you get the freshest produce at fair prices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold text-neutral-800 mb-2">Fast Delivery</h3>
              <p className="text-neutral-600">
                Order by 2 PM for next-day delivery in most areas. We ensure your produce arrives fresh.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold text-neutral-800 mb-2">Quality Guaranteed</h3>
              <p className="text-neutral-600">
                We personally inspect all produce before shipping. Not satisfied? We'll replace it or refund you.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold text-neutral-800 mb-2">Wholesale Pricing</h3>
              <p className="text-neutral-600">
                Get the best prices on bulk orders. The more you order, the more you save.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-secondary/10 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-heading font-bold text-neutral-800 mb-4">Ready to Order Fresh Produce?</h2>
          <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            Browse our selection of farm-fresh fruits and vegetables and place your order today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary-dark text-white text-lg px-8"
              onClick={() => navigate("/products")}
            >
              View Products
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 text-lg px-8"
              onClick={() => navigate("/track-order")}
            >
              Track Your Order
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
