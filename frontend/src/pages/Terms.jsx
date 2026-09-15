import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import TermsContentEn from '../components/TermsContentEn';
import TermsContentBn from '../components/TermsContentBn';

const Terms = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mb-24">
      <div className="bg-[#fbf8eb] rounded-xl shadow-lg border border-[#e1b73e] p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[#673c1c] mb-6 border-b-2 border-[#bc7b1f] pb-4">
          {t('terms_and_conditions')}
        </h1>

        <div className="prose prose-amber max-w-none text-[#965a1a]">
          {language === 'bn' ? <TermsContentBn /> : <TermsContentEn />}

          <hr className="my-8 border-[#bc7b1f]" />
          <h2 className="text-3xl font-bold text-[#673c1c] mt-8 mb-4 text-center">{t('important_notice')}</h2>
          
          {language === 'bn' ? (
            <>
              <p className="mb-4">একটি ঋণ গ্রহণ করার আগে দয়া করে সমস্ত ঋণের নথিপত্র সাবধানে পড়ুন। নিশ্চিত করুন যে আপনি ঋণের পরিমাণ, সুদের হার, ফি, পরিশোধের সময়সূচী, নির্ধারিত তারিখ এবং খেলাপির পরিণতি বুঝতে পেরেছেন। মিথ্যা তথ্য প্রদান করবেন না বা বিদ্যমান আর্থিক বাধ্যবাধকতা গোপন করবেন না।</p>
              <p className="mb-4">সংস্থার ওয়েবসাইটে নিবন্ধন ঋণ অনুমোদনের নিশ্চয়তা দেয় না। সংস্থা তার প্রযোজ্য যাচাইকরণ এবং অনুমোদন প্রক্রিয়া সম্পন্ন করার পরেই একটি ঋণের আবেদন বিবেচনা করা হবে।</p>
              <p className="mb-4">ওয়েবসাইটটি প্রাথমিকভাবে একটি গ্রাহক যোগাযোগ, অ্যাপ্লিকেশন পরিচালনা, ঋণ খতিয়ান, কিস্তি ট্র্যাকিং এবং রেকর্ড রাখার প্ল্যাটফর্ম হিসাবে কাজ করে। এটি নিজে ব্যাঙ্কিং পরিষেবা প্রদান করে না, গ্রাহকের তহবিল ধারণ করে না বা স্বাধীনভাবে আর্থিক লেনদেন প্রক্রিয়া বা সম্পাদন করে না। প্রকৃত আর্থিক লেনদেন এবং তাদের যাচাইকরণ সংস্থা তার প্রযোজ্য পদ্ধতি অনুযায়ী আলাদাভাবে পরিচালনা করে।</p>
              <p className="mb-4">দয়া করে নিশ্চিত করুন যে সংস্থায় জমা দেওয়া সমস্ত ব্যক্তিগত তথ্য এবং নথিপত্র সঠিক এবং আপনার নিজস্ব বা যথাযথ অনুমোদনের সাথে জমা দেওয়া হয়েছে।</p>
              <p className="mb-4">যোগ্যতা, নিবন্ধন, পরিশোধ, ঋণের শর্তাবলী, অর্থপ্রদানের স্থিতি বা অন্যান্য বিষয়ে কোনো প্রশ্নের জন্য, প্রযোজ্য ঋণ চুক্তি গ্রহণ বা স্বাক্ষর করার আগে অনুগ্রহ করে সংস্থার সাথে যোগাযোগ করুন।</p>
              <p className="mb-4">নিবন্ধন বা ঋণের আবেদন এগিয়ে নিয়ে যাওয়ার মাধ্যমে, আবেদনকারী নিশ্চিত করেন যে তারা প্রযোজ্য শর্তাবলী পড়েছেন, বুঝেছেন এবং সম্মত হয়েছেন।</p>
            </>
          ) : (
            <>
              <p className="mb-4">Please read all loan documents carefully before accepting a loan. Make sure you understand the loan amount, interest rate, fees, repayment schedule, due dates, and consequences of default. Do not provide false information or conceal existing financial obligations.</p>
              <p className="mb-4">Registration on the Organization's website does not guarantee loan approval. A loan application will be considered only after the Organization completes its applicable verification and approval process.</p>
              <p className="mb-4">The website primarily functions as a customer communication, application-management, loan-ledger, installment-tracking, and record-keeping platform. It does not itself provide banking services, hold customer funds, or independently process or execute financial transactions. Actual financial transactions and their verification are handled separately by the Organization according to its applicable procedures.</p>
              <p className="mb-4">Please ensure that all personal information and documents submitted to the Organization are accurate and belong to you or are submitted with appropriate authorization.</p>
              <p className="mb-4">For any questions regarding eligibility, registration, repayment, loan terms, payment status, or other matters, please contact the Organization before accepting or signing the applicable loan agreement.</p>
              <p className="mb-4">By proceeding with registration or a loan application, the applicant confirms that they have read, understood, and agreed to the applicable Terms & Conditions.</p>
            </>
          )}

          <h2 className="text-2xl font-bold text-[#7b481c] mt-12 mb-4">{t('contact_information')}</h2>
          <p className="mb-4 text-lg">
            {language === 'bn' ? (
              <>
                এই শর্তাবলী সংক্রান্ত যেকোনো প্রশ্ন বা উদ্বেগের জন্য, অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন:<br /><br />
                <strong>সুধারা মহিলা উন্নয়ন সংস্থা</strong><br />
                রানাঘাট, নদীয়া, রামনগর মিলন বাগান স্কুল পাড়া<br />
                ফোন: 7029368862 / 9046377730
              </>
            ) : (
              <>
                For any queries or concerns regarding these Terms, please contact us at:<br /><br />
                <strong>Shudhara Women Development Organization</strong><br />
                Ranaghat, Nadia, Ramnagar Milan Bagan school para<br />
                Phone: 7029368862 / 9046377730
              </>
            )}
          </p>

        </div>
      </div>
      
      {/* Fixed Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e1b73e] p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex justify-center">
        <button 
          onClick={() => navigate(-1)} 
          className="bg-[#bc7b1f] text-white px-8 py-3 rounded-lg font-bold text-lg shadow-md hover:bg-[#965a1a] hover:shadow-lg transition-all"
        >
          {t('go_back_to_dashboard')}
        </button>
      </div>
    </div>
  );
};

export default Terms;
