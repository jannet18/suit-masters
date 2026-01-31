import Link from "next/link";

const CustomizationSection = () => {
  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <div className="relative">
              <img
                src="https://media.istockphoto.com/id/1293365373/photo/you-have-to-be-patient.jpg?s=1024x1024&w=is&k=20&c=5O_W40h16fqF3fn6IRjsgK63xb0V4BxLrsBvC_phnpw="
                alt="Tailor measuring a suit"
                className="rounded-lg shadow-2xl w-full"
              />
              {/* <div className="absolute -bottom-6 -right-6 bg-amber-600 p-4 md:p-6 rounded-lg shadow-xl">
                <p className="text-lg md:text-2xl font-serif">
                  Over 25 years of excellence in tailoring
                </p>
              </div> */}
            </div>
          </div>
          <div className="md:w-1/2 md:pl-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
              Custom Tailoring
            </h2>
            <p className="text-gray-300 mb-8">
              Experience the art of bespoke tailoring with our master craftsmen.
              We believe that the perfect suit is one that is made specifically
              for you, taking into account your unique measurements,
              preferences, and style.
            </p>
            {/* <div className="space-y-6">
              {[{
              title: 'Personal Consultation',
              description: 'One-on-one session with our expert tailors'
            }, {
              title: 'Premium Fabrics',
              description: 'Select from over 2000 luxury fabrics'
            }, {
              title: 'Perfect Fit',
              description: 'Multiple fittings to ensure impeccable results'
            }].map((item, index) => <div key={index} className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium text-white">
                      {item.title}
                    </h3>
                    <p className="text-gray-400">{item.description}</p>
                  </div>
                </div>)}
            </div> */}

            <Link
              href="/customize"
              className="mt-10 bg-white text-gray-900 hover:bg-amber-600 hover:text-white font-medium py-3 px-8 transition-colors duration-300 rounded-lg cursor-pointer"
            >
              Customize Your Suit
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
export default CustomizationSection;
