import React from "react";

const InfoRow = ({ labelEn, labelJa, children }) => (
  <div className="border-t border-green-100 first:border-t-0 py-3 md:py-4">
    <div className="grid md:grid-cols-[220px,1fr] gap-2 md:gap-4">
      <div className="text-xs font-semibold tracking-wide text-green-700 uppercase">
        <div>{labelEn}</div>
        <div className="mt-0.5 text-[11px] normal-case text-green-500">
          {labelJa}
        </div>
      </div>
      <div className="text-sm text-green-900 leading-relaxed">{children}</div>
    </div>
  </div>
);

const BusinessInfo = () => {
  return (
    <div className="min-h-screen bg-green-50 text-green-950 flex items-start justify-center px-4 py-10 md:py-14">
      <article className="w-full max-w-3xl bg-white border border-green-100 rounded-3xl shadow-sm p-6 md:p-8">
        {/* Title / Intro */}
        <header className="mb-6 md:mb-8 border-b border-green-100 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-green-950 mb-2">
            Specified Commercial Transactions Act Notice
          </h1>
          <p className="text-sm font-medium text-green-700">
            特定商取引法に基づく表示
          </p>
          <p className="mt-4 text-sm text-green-800 leading-relaxed">
            This page provides business information for the Halal Lens
            application in accordance with the Japanese Specified Commercial
            Transactions Act (特定商取引法).
          </p>
        </header>

        {/* Main info table */}
        <section aria-label="Business information">
          <InfoRow labelEn="Business Name" labelJa="事業者名">
            <p>Halal Lens</p>
          </InfoRow>

          <InfoRow labelEn="Business Operator" labelJa="事業者の責任者">
            <p>Prince Faisal（プリンス・ファイサル）</p>
          </InfoRow>

          <InfoRow labelEn="Address" labelJa="所在地">
            <p>
              Minami Sengi Machi 1615-2
              <br />
              Isesaki, 372-0033
              <br />
              Japan (JP)
            </p>
            <p className="mt-2 text-xs text-green-700">
              ※ This address is used for legal disclosure under the Specified
              Commercial Transactions Act.
            </p>
          </InfoRow>

          <InfoRow labelEn="Contact Email" labelJa="連絡先メールアドレス">
            <a
              href="mailto:contact@halallens.org"
              className="underline hover:text-green-700"
            >
              contact@halallens.org
            </a>
            <p className="mt-2 text-xs text-green-700">
              We usually respond within 24–48 hours on business days.
            </p>
          </InfoRow>

          <InfoRow labelEn="Website" labelJa="ウェブサイト">
            <a
              href="https://halallens.org"
              className="text-green-800 underline break-all hover:text-green-600"
            >
              https://halallens.org
            </a>
          </InfoRow>

          <InfoRow labelEn="Service Provided" labelJa="提供するサービスの内容">
            <p>
              A digital mobile application that analyzes product ingredients and
              determines halal, suspicious, or haram status using:
            </p>
            <ul className="mt-1 list-disc list-inside space-y-1 text-green-800">
              <li>Barcode and QR code scanning</li>
              <li>AI-powered ingredient analysis</li>
              <li>Halal / suspicious / haram classification</li>
              <li>Product detail pages with ingredient breakdown</li>
              <li>Scan history for logged-in users</li>
            </ul>
            <p className="mt-2 text-xs text-green-700">
              モバイルアプリを通じて、バーコード・QRコードの読み取りおよび AI
              による原材料分析を行い、ハラール・要注意・ハラームの区分を
              情報提供目的で表示します。
            </p>
          </InfoRow>

          <InfoRow labelEn="Price" labelJa="販売価格">
            <p>
              The price for each subscription or digital product is displayed on
              the web-based billing page and on purchase screen
              before payment.
            </p>
            <p className="mt-2 text-xs text-green-700">
              各プラン・デジタル商品の価格は、決済前にウェブ上のチェックアウト画面
              またはアプリストアの購入画面に表示されます。
            </p>
            {/* OPTIONAL: uncomment and fill if you want concrete examples visible on the page
            <ul className="mt-2 list-disc list-inside text-green-800 text-sm">
              <li>Halal Lens Premium (Monthly): ¥XXX</li>
              <li>Halal Lens Premium (Yearly): ¥YYY</li>
            </ul>
            */}
          </InfoRow>

          <InfoRow labelEn="Additional Fees" labelJa="商品代金以外の必要料金">
            <p>
              None charged by Halal Lens. Users are responsible for any mobile
              data charges, internet connection fees, or currency conversion
              fees billed by their provider.
            </p>
            <p className="mt-2 text-xs text-green-700">
              ハラールレンズ側から追加手数料は請求しません。通信料・データ通信費・
              為替手数料などはお客様のご契約の通信事業者・決済事業者の条件に従います。
            </p>
          </InfoRow>

          <InfoRow labelEn="Payment Method" labelJa="支払方法">
            <p>
              Stripe card payments (credit/debit cards) and other methods
              supported by Stripe or the platform (Apple, Google, or web).
            </p>
            <p className="mt-2 text-xs text-green-700">
              クレジットカード・デビットカードなど、Stripe
              またはご利用プラットフォーム （Apple / Google /
              Web）がサポートする支払方法をご利用いただけます。
            </p>
          </InfoRow>

          <InfoRow labelEn="Payment Timing" labelJa="支払時期">
            <p>
              Payment is charged at the time you confirm the purchase.
            </p>
            <p className="mt-2 text-xs text-green-700">
              ご購入の確定時に決済が行われます。
            </p>
          </InfoRow>

          <InfoRow labelEn="Delivery Time" labelJa="商品の引き渡し時期">
            <p>
              Digital service — access to paid features is available immediately
              after successful payment.
            </p>
            <p className="mt-2 text-xs text-green-700">
              デジタルサービスのため、決済完了後すぐに有料機能をご利用いただけます。
            </p>
          </InfoRow>

          <InfoRow labelEn="Refund Policy" labelJa="返品・返金について">
            <p>
              No refunds are provided except where legally required under
              applicable laws. Because the service is digital and available
              immediately after purchase, cancellations after activation are
              generally not accepted.
            </p>
            <p className="mt-2 text-xs text-green-700">
              デジタルサービスの性質上、原則として購入後の返金は行っておりません。
              ただし、法令により返金が義務付けられている場合を除きます。
            </p>
            <p className="mt-2 text-xs text-green-700">
              不正請求や誤課金などが疑われる場合は、
              <a href="mailto:contact@halallens.org" className="underline ml-1">
                contact@halallens.org
              </a>
              までご連絡ください。
            </p>
          </InfoRow>

          <InfoRow labelEn="Required System Environment" labelJa="動作環境">
            <p>
              A compatible smartphone (iOS or Android), camera access, and an
              active internet connection are required to use Halal Lens.
            </p>
            <p className="mt-2 text-xs text-green-700">
              対応するスマートフォン（iOS または Android）、カメラ機能、
              およびインターネット接続が必要です。
            </p>
          </InfoRow>

          <InfoRow labelEn="Other Notes" labelJa="その他">
            <p>
              Service details, pricing, and terms may change in the future.
              Important updates will be announced in the app or on the official
              website. Please review this page periodically for the latest
              information.
            </p>
            <p className="mt-2 text-xs text-green-700">
              サービス内容・価格・利用条件は将来変更される場合があります。
              重要な変更がある場合は、アプリ内または公式ウェブサイト上でお知らせします。
            </p>
          </InfoRow>
        </section>
      </article>
    </div>
  );
};

export default BusinessInfo;
