import React, { useEffect } from 'react';

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-[#fbf8eb] rounded-xl shadow-lg border border-[#e1b73e] p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[#673c1c] mb-6 border-b-2 border-[#bc7b1f] pb-4">
          Terms and Conditions
        </h1>
        
        <div className="prose prose-amber max-w-none text-[#965a1a]">
          <p className="mb-4">
            <strong>Last Updated: {new Date().toLocaleDateString()}</strong>
          </p>
          
          <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">1. Introduction</h2>
          <p className="mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>

          <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">2. Eligibility for Loans</h2>
          <p className="mb-4">
            Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam consequat.
          </p>

          <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">3. Repayment Terms</h2>
          <p className="mb-4">
            Phasellus tristique libero vel justo aliquam pellentesque. Morbi egestas mattis placerat. Aenean hendrerit tristique congue. In hendrerit magna eu rhoncus fermentum. Integer consequat erat leo, eu ullamcorper justo faucibus in. Morbi facilisis turpis sit amet auctor egestas. Pellentesque aliquet accumsan iaculis. Praesent egestas in magna quis luctus. Etiam a orci pretium, hendrerit mauris eu, consequat mauris. Nullam sodales vel ipsum et ullamcorper. Praesent feugiat eros quis neque ornare, sed luctus felis dictum. 
          </p>

          <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">4. Fines and Penalties</h2>
          <p className="mb-4">
            Fusce euismod consequat ante. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Pellentesque sed dui ut augue blandit vehicula. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam aliquet volutpat. Integer adipiscing erat eget risus. Vestibulum rutrum, mi nec elementum vehicula, eros quam gravida nisl, id fringilla neque ante vel mi. 
          </p>

          <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">5. Account Cancellation</h2>
          <p className="mb-4">
            Nam adipiscing. Vestibulum cursus interdum urna. Nullam hendrerit diam in magna. Praesent in arcu ac diam vulputate semper. Morbi eu mauris. Quisque sollicitudin elit eu odio. Aliquam hendrerit mi vel magna. Curabitur accumsan pretium dolor. Fusce nec enim tempor turpis vehicula congue. Proin sodales metus ac magna condimentum imperdiet. Phasellus vitae pede vitae purus rhoncus porta. Suspendisse non neque. Donec eu diam quis odio aliquet placerat. Proin consequat, ante ac faucibus viverra, ante eros tincidunt neque, et varius nibh turpis in lacus. Vestibulum ac purus vitae nulla aliquet aliquet. Aenean aliquet mattis mauris.
          </p>

          <h2 className="text-2xl font-bold text-[#7b481c] mt-8 mb-4">6. Contact Information</h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at:<br/>
            <strong>Shudhara Women Development Organization</strong><br/>
            Ranaghat, Nadia, Ramnagar Milan Bagan school para<br/>
            Phone: 7029368862 / 9046377730
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
