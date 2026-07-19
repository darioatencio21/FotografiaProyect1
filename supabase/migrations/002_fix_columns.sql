-- Fix column naming: rename all columns to camelCase to match frontend TypeScript types
-- Run this in Supabase SQL Editor after 001_init.sql

-- photographs
ALTER TABLE photographs RENAME COLUMN is_favorite TO "isFavorite";
ALTER TABLE photographs RENAME COLUMN is_featured TO "isFeatured";

-- blogposts
ALTER TABLE blogposts RENAME COLUMN readtime TO "readTime";
ALTER TABLE blogposts RENAME COLUMN seokeywords TO "seoKeywords";

-- bookings
ALTER TABLE bookings RENAME COLUMN clientname TO "clientName";
ALTER TABLE bookings RENAME COLUMN clientemail TO "clientEmail";
ALTER TABLE bookings RENAME COLUMN clientphone TO "clientPhone";
ALTER TABLE bookings RENAME COLUMN timeslot TO "timeSlot";
ALTER TABLE bookings RENAME COLUMN serviceid TO "serviceId";
ALTER TABLE bookings RENAME COLUMN peoplecount TO "peopleCount";
ALTER TABLE bookings RENAME COLUMN createdat TO "createdAt";
ALTER TABLE bookings RENAME COLUMN isread TO "isRead";

-- messages
ALTER TABLE messages RENAME COLUMN createdat TO "createdAt";
ALTER TABLE messages RENAME COLUMN isread TO "isRead";
ALTER TABLE messages RENAME COLUMN replytext TO "replyText";
ALTER TABLE messages RENAME COLUMN replyat TO "replyAt";

-- clientaccounts
ALTER TABLE clientaccounts RENAME COLUMN clientname TO "clientName";
ALTER TABLE clientaccounts RENAME COLUMN clientemail TO "clientEmail";
ALTER TABLE clientaccounts RENAME COLUMN sessiondate TO "sessionDate";
ALTER TABLE clientaccounts RENAME COLUMN sessiontitle TO "sessionTitle";
ALTER TABLE clientaccounts RENAME COLUMN createdat TO "createdAt";

-- photography_packages
ALTER TABLE photography_packages RENAME COLUMN pricefromtext_es TO "priceFromText_es";
ALTER TABLE photography_packages RENAME COLUMN pricefromtext_en TO "priceFromText_en";
ALTER TABLE photography_packages RENAME COLUMN buttontext_es TO "buttonText_es";
ALTER TABLE photography_packages RENAME COLUMN buttontext_en TO "buttonText_en";
ALTER TABLE photography_packages RENAME COLUMN travelnote_es TO "travelNote_es";
ALTER TABLE photography_packages RENAME COLUMN travelnote_en TO "travelNote_en";
ALTER TABLE photography_packages RENAME COLUMN sortorder TO "sortOrder";

-- session_categories
ALTER TABLE session_categories RENAME COLUMN sortorder TO "sortOrder";

-- seo
ALTER TABLE seo RENAME COLUMN ogtitle TO "ogTitle";
ALTER TABLE seo RENAME COLUMN ogdescription TO "ogDescription";
ALTER TABLE seo RENAME COLUMN ogimage TO "ogImage";
ALTER TABLE seo RENAME COLUMN twittercard TO "twitterCard";
ALTER TABLE seo RENAME COLUMN robotstext TO "robotsText";
ALTER TABLE seo RENAME COLUMN heroimageleft TO "heroImageLeft";
ALTER TABLE seo RENAME COLUMN heroimageright TO "heroImageRight";

-- profile
ALTER TABLE profile RENAME COLUMN avatarurl TO "avatarUrl";
ALTER TABLE profile RENAME COLUMN preferredcamera TO "preferredCamera";
ALTER TABLE profile RENAME COLUMN preferredlens TO "preferredLens";
ALTER TABLE profile RENAME COLUMN abouttitle_es TO "aboutTitle_es";
ALTER TABLE profile RENAME COLUMN abouttitle_en TO "aboutTitle_en";
ALTER TABLE profile RENAME COLUMN abouttext1_es TO "aboutText1_es";
ALTER TABLE profile RENAME COLUMN abouttext2_es TO "aboutText2_es";
ALTER TABLE profile RENAME COLUMN abouttext1_en TO "aboutText1_en";
ALTER TABLE profile RENAME COLUMN abouttext2_en TO "aboutText2_en";

-- bookingconfig
ALTER TABLE bookingconfig RENAME COLUMN timeslots TO "timeSlots";
ALTER TABLE bookingconfig RENAME COLUMN availabledays TO "availableDays";
ALTER TABLE bookingconfig RENAME COLUMN blockeddates TO "blockedDates";

-- emailconfig
ALTER TABLE emailconfig RENAME COLUMN emailjsserviceid TO "emailjsServiceId";
ALTER TABLE emailconfig RENAME COLUMN emailjstemplateid TO "emailjsTemplateId";
ALTER TABLE emailconfig RENAME COLUMN emailjspublickey TO "emailjsPublicKey";
ALTER TABLE emailconfig RENAME COLUMN receiveremail TO "receiverEmail";
ALTER TABLE emailconfig RENAME COLUMN enableautoresponse TO "enableAutoResponse";
ALTER TABLE emailconfig RENAME COLUMN emailjsautotemplateid TO "emailjsAutoTemplateId";
ALTER TABLE emailconfig RENAME COLUMN autoreplysubject TO "autoReplySubject";
ALTER TABLE emailconfig RENAME COLUMN autoreplymessage TO "autoReplyMessage";

-- analytics
ALTER TABLE analytics RENAME COLUMN totalvisits TO "totalVisits";
ALTER TABLE analytics RENAME COLUMN totalrevenue TO "totalRevenue";
ALTER TABLE analytics RENAME COLUMN bookingconversionrate TO "bookingConversionRate";
ALTER TABLE analytics RENAME COLUMN sessionscount TO "sessionsCount";
ALTER TABLE analytics RENAME COLUMN revenuebymonth TO "revenueByMonth";
ALTER TABLE analytics RENAME COLUMN sessionsbyservice TO "sessionsByService";
ALTER TABLE analytics RENAME COLUMN visitsbyday TO "visitsByDay";
