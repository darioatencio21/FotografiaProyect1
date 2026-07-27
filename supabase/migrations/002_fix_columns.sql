-- Fix column naming: rename all columns to camelCase to match frontend TypeScript types
-- Wrapped in DO blocks to skip if columns were already renamed.

DO $$ BEGIN
  ALTER TABLE photographs RENAME COLUMN is_favorite TO "isFavorite";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE photographs RENAME COLUMN is_featured TO "isFeatured";
EXCEPTION WHEN undefined_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE blogposts RENAME COLUMN readtime TO "readTime";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE blogposts RENAME COLUMN seokeywords TO "seoKeywords";
EXCEPTION WHEN undefined_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE bookings RENAME COLUMN clientname TO "clientName";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE bookings RENAME COLUMN clientemail TO "clientEmail";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE bookings RENAME COLUMN clientphone TO "clientPhone";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE bookings RENAME COLUMN timeslot TO "timeSlot";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE bookings RENAME COLUMN serviceid TO "serviceId";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE bookings RENAME COLUMN peoplecount TO "peopleCount";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE bookings RENAME COLUMN createdat TO "createdAt";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE bookings RENAME COLUMN isread TO "isRead";
EXCEPTION WHEN undefined_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE messages RENAME COLUMN createdat TO "createdAt";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE messages RENAME COLUMN isread TO "isRead";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE messages RENAME COLUMN replytext TO "replyText";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE messages RENAME COLUMN replyat TO "replyAt";
EXCEPTION WHEN undefined_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE clientaccounts RENAME COLUMN clientname TO "clientName";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE clientaccounts RENAME COLUMN clientemail TO "clientEmail";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE clientaccounts RENAME COLUMN sessiondate TO "sessionDate";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE clientaccounts RENAME COLUMN sessiontitle TO "sessionTitle";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE clientaccounts RENAME COLUMN createdat TO "createdAt";
EXCEPTION WHEN undefined_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE photography_packages RENAME COLUMN pricefromtext_es TO "priceFromText_es";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE photography_packages RENAME COLUMN pricefromtext_en TO "priceFromText_en";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE photography_packages RENAME COLUMN buttontext_es TO "buttonText_es";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE photography_packages RENAME COLUMN buttontext_en TO "buttonText_en";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE photography_packages RENAME COLUMN travelnote_es TO "travelNote_es";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE photography_packages RENAME COLUMN travelnote_en TO "travelNote_en";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE photography_packages RENAME COLUMN sortorder TO "sortOrder";
EXCEPTION WHEN undefined_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE session_categories RENAME COLUMN sortorder TO "sortOrder";
EXCEPTION WHEN undefined_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE seo RENAME COLUMN ogtitle TO "ogTitle";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE seo RENAME COLUMN ogdescription TO "ogDescription";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE seo RENAME COLUMN ogimage TO "ogImage";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE seo RENAME COLUMN twittercard TO "twitterCard";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE seo RENAME COLUMN robotstext TO "robotsText";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE seo RENAME COLUMN heroimageleft TO "heroImageLeft";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE seo RENAME COLUMN heroimageright TO "heroImageRight";
EXCEPTION WHEN undefined_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE profile RENAME COLUMN avatarurl TO "avatarUrl";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE profile RENAME COLUMN preferredcamera TO "preferredCamera";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE profile RENAME COLUMN preferredlens TO "preferredLens";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE profile RENAME COLUMN abouttitle_es TO "aboutTitle_es";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE profile RENAME COLUMN abouttitle_en TO "aboutTitle_en";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE profile RENAME COLUMN abouttext1_es TO "aboutText1_es";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE profile RENAME COLUMN abouttext2_es TO "aboutText2_es";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE profile RENAME COLUMN abouttext1_en TO "aboutText1_en";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE profile RENAME COLUMN abouttext2_en TO "aboutText2_en";
EXCEPTION WHEN undefined_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE bookingconfig RENAME COLUMN timeslots TO "timeSlots";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE bookingconfig RENAME COLUMN availabledays TO "availableDays";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE bookingconfig RENAME COLUMN blockeddates TO "blockedDates";
EXCEPTION WHEN undefined_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE emailconfig RENAME COLUMN emailjsserviceid TO "emailjsServiceId";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE emailconfig RENAME COLUMN emailjstemplateid TO "emailjsTemplateId";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE emailconfig RENAME COLUMN emailjspublickey TO "emailjsPublicKey";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE emailconfig RENAME COLUMN receiveremail TO "receiverEmail";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE emailconfig RENAME COLUMN enableautoresponse TO "enableAutoResponse";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE emailconfig RENAME COLUMN emailjsautotemplateid TO "emailjsAutoTemplateId";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE emailconfig RENAME COLUMN autoreplysubject TO "autoReplySubject";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE emailconfig RENAME COLUMN autoreplymessage TO "autoReplyMessage";
EXCEPTION WHEN undefined_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE analytics RENAME COLUMN totalvisits TO "totalVisits";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE analytics RENAME COLUMN totalrevenue TO "totalRevenue";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE analytics RENAME COLUMN bookingconversionrate TO "bookingConversionRate";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE analytics RENAME COLUMN sessionscount TO "sessionsCount";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE analytics RENAME COLUMN revenuebymonth TO "revenueByMonth";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE analytics RENAME COLUMN sessionsbyservice TO "sessionsByService";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE analytics RENAME COLUMN visitsbyday TO "visitsByDay";
EXCEPTION WHEN undefined_column THEN NULL; END $$;
