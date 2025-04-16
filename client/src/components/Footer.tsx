import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-heading font-bold mb-4">FreshBulk</h3>
            <p className="text-neutral-300">
              Your trusted partner for bulk fresh produce ordering, delivering quality fruits and vegetables at wholesale prices.
            </p>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products">
                  <a className="text-neutral-300 hover:text-white transition-colors">Products</a>
                </Link>
              </li>
              <li>
                <Link href="/place-order">
                  <a className="text-neutral-300 hover:text-white transition-colors">Place Order</a>
                </Link>
              </li>
              <li>
                <Link href="/track-order">
                  <a className="text-neutral-300 hover:text-white transition-colors">Track Order</a>
                </Link>
              </li>
              <li>
                <Link href="/admin">
                  <a className="text-neutral-300 hover:text-white transition-colors">Admin</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold mb-4">Contact Us</h4>
            <address className="text-neutral-300 not-italic">
              <p className="mb-2">123 Market Street</p>
              <p className="mb-2">Bangalore, Karnataka 560001</p>
              <p className="mb-2">Email: support@freshbulk.com</p>
              <p>Phone: +91 1234567890</p>
            </address>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-neutral-700 text-center text-neutral-400">
          <p>&copy; {new Date().getFullYear()} FreshBulk. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
