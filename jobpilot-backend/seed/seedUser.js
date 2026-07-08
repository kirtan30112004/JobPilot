'use strict';

const mongoose = require('mongoose');
const Company   = require('../models/Company');
const Job       = require('../models/Job');
const Interview = require('../models/Interview');
const Reminder  = require('../models/Reminder');

/* ── Date helpers ─────────────────────────────────────────────── */

function daysAgo(n)     { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function daysFromNow(n) { const d = new Date(); d.setDate(d.getDate() + n); return d; }

function dateTimeAgo(days, hour = 10, minute = 0) {
  const d = daysAgo(days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function dateTimeFromNow(days, hour = 10, minute = 0) {
  const d = daysFromNow(days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/* ── Company seed data ───────────────────────────────────────── */

function buildCompanies(userId) {
  return [
    { _id: new mongoose.Types.ObjectId(), user: userId, name: 'Google',      website: 'https://careers.google.com',                         industry: 'Technology',                           location: 'Mountain View, CA',      size: '5000+', recruiters: [{ name: 'Priya Sharma',          designation: 'Technical Recruiter',                          email: 'priya.sharma@google.com',            phone: '+1-650-555-0101', linkedIn: 'https://linkedin.com/in/priya-sharma-google'            }, { name: 'Arjun Mehta',          designation: 'Senior Recruiter — Engineering',               email: 'arjun.mehta@google.com',             phone: '+1-650-555-0102', linkedIn: 'https://linkedin.com/in/arjun-mehta-google'             }], notes: 'Applied through referral. Onsite loop typically 5 rounds. TC highly competitive.'          },
    { _id: new mongoose.Types.ObjectId(), user: userId, name: 'Microsoft',   website: 'https://careers.microsoft.com',                      industry: 'Technology',                           location: 'Redmond, WA',            size: '5000+', recruiters: [{ name: 'Kavya Nair',            designation: 'University & Technical Recruiter',             email: 'kavya.nair@microsoft.com',           phone: '+1-425-555-0201', linkedIn: 'https://linkedin.com/in/kavya-nair-microsoft'            }, { name: 'Rohan Desai',          designation: 'Talent Acquisition Specialist',                email: 'rohan.desai@microsoft.com',          phone: '+1-425-555-0202', linkedIn: 'https://linkedin.com/in/rohan-desai-microsoft'           }], notes: 'Growth mindset culture. Strong Azure and AI hiring push this year.'                        },
    { _id: new mongoose.Types.ObjectId(), user: userId, name: 'Amazon',      website: 'https://amazon.jobs',                                industry: 'Technology / E-Commerce',              location: 'Seattle, WA',            size: '5000+', recruiters: [{ name: 'Sneha Kulkarni',        designation: 'Technical Recruiter — AWS',                    email: 'sneha.kulkarni@amazon.com',          phone: '+1-206-555-0301', linkedIn: 'https://linkedin.com/in/sneha-kulkarni-amazon'           }],                                                                                                      notes: 'Leadership Principles central. Prepare STAR-format stories for all 16 LPs.'              },
    { _id: new mongoose.Types.ObjectId(), user: userId, name: 'Apple',       website: 'https://jobs.apple.com',                             industry: 'Consumer Electronics / Software',      location: 'Cupertino, CA',          size: '5000+', recruiters: [{ name: 'Divya Iyer',           designation: 'Recruiter — Software Engineering',             email: 'divya.iyer@apple.com',               phone: '+1-408-555-0401', linkedIn: 'https://linkedin.com/in/divya-iyer-apple'                }],                                                                                                      notes: 'Secretive culture. NDA before technical discussions. Strong emphasis on ownership.'        },
    { _id: new mongoose.Types.ObjectId(), user: userId, name: 'Meta',        website: 'https://www.metacareers.com',                        industry: 'Social Media / Technology',            location: 'Menlo Park, CA',         size: '5000+', recruiters: [{ name: 'Ananya Pillai',        designation: 'Technical Sourcer — Infrastructure',           email: 'ananya.pillai@meta.com',             phone: '+1-650-555-0501', linkedIn: 'https://linkedin.com/in/ananya-pillai-meta'              }, { name: 'Vikram Patel',         designation: 'Senior Technical Recruiter',                   email: 'vikram.patel@meta.com',              phone: '+1-650-555-0502', linkedIn: 'https://linkedin.com/in/vikram-patel-meta'               }], notes: 'Move fast culture. Heavy systems design focus at senior levels.'                           },
    { _id: new mongoose.Types.ObjectId(), user: userId, name: 'Netflix',     website: 'https://jobs.netflix.com',                           industry: 'Streaming / Entertainment Technology', location: 'Los Gatos, CA',          size: '5000+', recruiters: [{ name: 'Ritu Verma',           designation: 'Engineering Talent Partner',                   email: 'ritu.verma@netflix.com',             phone: '+1-408-555-0601', linkedIn: 'https://linkedin.com/in/ritu-verma-netflix'              }],                                                                                                      notes: 'Highest base salaries. No bonus — all cash. Freedom and responsibility culture.'           },
    { _id: new mongoose.Types.ObjectId(), user: userId, name: 'Adobe',       website: 'https://www.adobe.com/careers.html',                 industry: 'Software / Creative Technology',       location: 'San Jose, CA',           size: '5000+', recruiters: [{ name: 'Supriya Joshi',        designation: 'Talent Acquisition Lead — Product Engineering', email: 'supriya.joshi@adobe.com',            phone: '+1-408-555-0701', linkedIn: 'https://linkedin.com/in/supriya-joshi-adobe'             }],                                                                                                      notes: 'Great work-life balance. Adobe Firefly AI team actively hiring.'                           },
    { _id: new mongoose.Types.ObjectId(), user: userId, name: 'Oracle',      website: 'https://www.oracle.com/careers',                     industry: 'Enterprise Software / Cloud',          location: 'Austin, TX',             size: '5000+', recruiters: [{ name: 'Manoj Rao',            designation: 'Sr. Recruiter — Oracle Cloud Infrastructure',  email: 'manoj.rao@oracle.com',               phone: '+1-512-555-0801', linkedIn: 'https://linkedin.com/in/manoj-rao-oracle'                }],                                                                                                      notes: 'OCI team is the growth area. Compensation improved significantly post-2023.'               },
    { _id: new mongoose.Types.ObjectId(), user: userId, name: 'IBM',         website: 'https://www.ibm.com/employment',                     industry: 'Enterprise Technology / Consulting',   location: 'Armonk, NY',             size: '5000+', recruiters: [{ name: 'Deepa Krishnan',       designation: 'Talent Acquisition Partner',                   email: 'deepa.krishnan@ibm.com',             phone: '+1-914-555-0901', linkedIn: 'https://linkedin.com/in/deepa-krishnan-ibm'              }],                                                                                                      notes: 'Watson and hybrid cloud roles most active. Stable brand, traditional process.'             },
    { _id: new mongoose.Types.ObjectId(), user: userId, name: 'Salesforce',  website: 'https://salesforce.com/company/careers',             industry: 'CRM / Cloud Software',                 location: 'San Francisco, CA',      size: '5000+', recruiters: [{ name: 'Nikhil Bhat',         designation: 'Technical Recruiter — Heroku & Platform',      email: 'nikhil.bhat@salesforce.com',         phone: '+1-415-555-1001', linkedIn: 'https://linkedin.com/in/nikhil-bhat-salesforce'          }, { name: 'Pooja Agarwal',        designation: 'Sourcing Recruiter',                           email: 'pooja.agarwal@salesforce.com',       phone: '+1-415-555-1002', linkedIn: 'https://linkedin.com/in/pooja-agarwal-salesforce'        }], notes: 'Ohana culture. Interview loop: 2 technical rounds + hiring manager + architecture.'        },
    { _id: new mongoose.Types.ObjectId(), user: userId, name: 'NVIDIA',      website: 'https://www.nvidia.com/en-us/about-nvidia/careers',  industry: 'Semiconductors / AI Hardware',         location: 'Santa Clara, CA',        size: '5000+', recruiters: [{ name: 'Harsha Reddy',         designation: 'Technical Recruiter — AI & GPU Computing',     email: 'harsha.reddy@nvidia.com',            phone: '+1-408-555-1101', linkedIn: 'https://linkedin.com/in/harsha-reddy-nvidia'             }],                                                                                                      notes: 'Explosive growth driven by AI/ML demand. Long interview cycles but strong TC.'             },
    { _id: new mongoose.Types.ObjectId(), user: userId, name: 'Intel',       website: 'https://jobs.intel.com',                             industry: 'Semiconductors / Hardware',            location: 'Santa Clara, CA',        size: '5000+', recruiters: [{ name: 'Sanjay Mishra',        designation: 'Engineering Recruiter — Developer Software',   email: 'sanjay.mishra@intel.com',            phone: '+1-408-555-1201', linkedIn: 'https://linkedin.com/in/sanjay-mishra-intel'             }],                                                                                                      notes: 'IDM 2.0 transformation underway. Software-centric strategy.'                              },
    { _id: new mongoose.Types.ObjectId(), user: userId, name: 'Cisco',       website: 'https://jobs.cisco.com',                             industry: 'Networking / Cybersecurity',           location: 'San Jose, CA',           size: '5000+', recruiters: [{ name: 'Lavanya Subramanian', designation: 'TA Specialist — Cloud Networking',             email: 'lavanya.subramanian@cisco.com',      phone: '+1-408-555-1301', linkedIn: 'https://linkedin.com/in/lavanya-subramanian-cisco'       }],                                                                                                      notes: 'Splunk acquisition opened many new observability roles. Stable culture.'                   },
    { _id: new mongoose.Types.ObjectId(), user: userId, name: 'Accenture',   website: 'https://www.accenture.com/us-en/careers',            industry: 'IT Consulting / Professional Services',location: 'Chicago, IL',            size: '5000+', recruiters: [{ name: 'Meera Gopalan',        designation: 'Talent Acquisition Analyst',                   email: 'meera.gopalan@accenture.com',        phone: '+1-312-555-1401', linkedIn: 'https://linkedin.com/in/meera-gopalan-accenture'         }, { name: 'Kiran Murthy',         designation: 'Sr. Recruiter — Technology Practice',          email: 'kiran.murthy@accenture.com',         phone: '+1-312-555-1402', linkedIn: 'https://linkedin.com/in/kiran-murthy-accenture'          }], notes: 'Cloud First and AI practices hiring. Manager-level roles need client delivery experience.'  },
    { _id: new mongoose.Types.ObjectId(), user: userId, name: 'Deloitte',    website: 'https://jobs2.deloitte.com',                         industry: 'Consulting / Professional Services',   location: 'New York, NY',           size: '5000+', recruiters: [{ name: 'Tanvi Bhatt',         designation: 'Campus & Experienced Hire Recruiter',          email: 'tanvi.bhatt@deloitte.com',           phone: '+1-212-555-1501', linkedIn: 'https://linkedin.com/in/tanvi-bhatt-deloitte'            }],                                                                                                      notes: 'Technology & Transformation practice expanding. Case study prep needed.'                   },
    { _id: new mongoose.Types.ObjectId(), user: userId, name: 'Tata Consultancy Services', website: 'https://ibegin.tcs.com',             industry: 'IT Services / Consulting',             location: 'New York, NY (US HQ)',   size: '5000+', recruiters: [{ name: 'Suresh Narayanan',    designation: 'Talent Acquisition Lead',                      email: 'suresh.narayanan@tcs.com',           phone: '+1-212-555-1601', linkedIn: 'https://linkedin.com/in/suresh-narayanan-tcs'            }, { name: 'Preeti Saxena',        designation: 'Recruitment Specialist — Digital',             email: 'preeti.saxena@tcs.com',              phone: '+1-212-555-1602', linkedIn: 'https://linkedin.com/in/preeti-saxena-tcs'               }], notes: 'US roles typically client-facing delivery. Strong BFSI and healthcare verticals.'          },
    { _id: new mongoose.Types.ObjectId(), user: userId, name: 'Infosys',     website: 'https://www.infosys.com/careers',                    industry: 'IT Services / Digital Transformation', location: 'Bellevue, WA (US HQ)',   size: '5000+', recruiters: [{ name: 'Ramya Chandrasekhar', designation: 'Talent Acquisition Manager',                  email: 'ramya.chandrasekhar@infosys.com',    phone: '+1-425-555-1701', linkedIn: 'https://linkedin.com/in/ramya-chandrasekhar-infosys'     }],                                                                                                      notes: 'Infosys Cobalt (cloud) and Topaz (AI) units growing fastest.'                             },
    { _id: new mongoose.Types.ObjectId(), user: userId, name: 'Wipro',       website: 'https://careers.wipro.com',                          industry: 'IT Services / Cloud & Engineering',    location: 'East Brunswick, NJ',     size: '5000+', recruiters: [{ name: 'Arun Venkataraman',   designation: 'Sr. Talent Acquisition Partner',               email: 'arun.venkataraman@wipro.com',        phone: '+1-732-555-1801', linkedIn: 'https://linkedin.com/in/arun-venkataraman-wipro'         }],                                                                                                      notes: 'FullStride Cloud and HOLMES AI platform roles active. Good work-life balance.'             },
    { _id: new mongoose.Types.ObjectId(), user: userId, name: 'Capgemini',   website: 'https://www.capgemini.com/careers',                  industry: 'IT Services / Engineering',            location: 'New York, NY',           size: '5000+', recruiters: [{ name: 'Nandini Chakraborty', designation: 'Recruitment Consultant — Technology',          email: 'nandini.chakraborty@capgemini.com',  phone: '+1-212-555-1901', linkedIn: 'https://linkedin.com/in/nandini-chakraborty-capgemini'   }],                                                                                                      notes: 'DEMS (Digital Engineering & Manufacturing Services) fastest growing unit.'                 },
    { _id: new mongoose.Types.ObjectId(), user: userId, name: 'Cognizant',   website: 'https://careers.cognizant.com',                      industry: 'IT Services / Digital Business',       location: 'Teaneck, NJ',            size: '5000+', recruiters: [{ name: 'Ishaan Ghosh',         designation: 'Talent Acquisition Specialist',                email: 'ishaan.ghosh@cognizant.com',         phone: '+1-201-555-2001', linkedIn: 'https://linkedin.com/in/ishaan-ghosh-cognizant'          }, { name: 'Swati Banerjee',       designation: 'Experienced Hire Recruiter — Digital Practice', email: 'swati.banerjee@cognizant.com',       phone: '+1-201-555-2002', linkedIn: 'https://linkedin.com/in/swati-banerjee-cognizant'        }], notes: 'North America digital engineering actively hiring. Structured interview process.'          },
  ];
}

/* ── Job seed data ───────────────────────────────────────────── */

function buildJobs(userId, companies) {
  const c = Object.fromEntries(companies.map((co) => [co.name, co]));
  return [
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Google']._id,     companyName: 'Google',     jobTitle: 'Senior Software Engineer — Backend',         jobDescription: 'Design and scale distributed backend services for Google Search infrastructure.',          jobUrl: 'https://careers.google.com/jobs/sse-backend-1001',       location: 'Mountain View, CA (Hybrid)',  jobType: 'Full-time', salaryRange: { min: 180000, max: 240000, currency: 'USD' }, status: 'Technical Round',  appliedDate: daysAgo(18), priority: 'High',   tags: ['backend','distributed-systems','referral','senior'],    notes: 'Referred by ex-colleague. Currently in L5 loop.'                                          },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Google']._id,     companyName: 'Google',     jobTitle: 'SDE-2 — Google Cloud Platform',               jobDescription: 'Build developer-facing APIs and tooling for Google Cloud.',                               jobUrl: 'https://careers.google.com/jobs/sde2-gcp-1002',          location: 'Sunnyvale, CA',              jobType: 'Full-time', salaryRange: { min: 155000, max: 210000, currency: 'USD' }, status: 'Offer',            appliedDate: daysAgo(45), priority: 'High',   tags: ['cloud','gcp','sde2'],                                   notes: 'Offer received. Evaluating against Netflix offer.'                                         },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Google']._id,     companyName: 'Google',     jobTitle: 'AI Engineer — Google DeepMind',               jobDescription: 'Research and implement deep learning architectures for multi-modal AI systems.',         jobUrl: 'https://careers.google.com/jobs/ai-deepmind-1003',       location: 'London, UK',                 jobType: 'Full-time', salaryRange: { min: 200000, max: 280000, currency: 'USD' }, status: 'Rejected',         appliedDate: daysAgo(60), priority: 'High',   tags: ['ai','deepmind','ml','research'],                         notes: 'Rejected after onsite.'                                                                    },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Microsoft']._id,  companyName: 'Microsoft',  jobTitle: 'Senior Software Engineer — Azure Compute',    jobDescription: 'Architect and deliver core Azure virtual machine and container services.',              jobUrl: 'https://careers.microsoft.com/jobs/azure-sre-2001',      location: 'Redmond, WA',               jobType: 'Full-time', salaryRange: { min: 170000, max: 225000, currency: 'USD' }, status: 'HR Round',         appliedDate: daysAgo(22), priority: 'High',   tags: ['azure','cloud','infrastructure','senior'],               notes: 'Cleared technical loop. HR round call scheduled.'                                          },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Microsoft']._id,  companyName: 'Microsoft',  jobTitle: 'Full Stack Developer — Microsoft 365',        jobDescription: 'Build rich collaborative features for the Microsoft 365 suite.',                         jobUrl: 'https://careers.microsoft.com/jobs/m365-fullstack-2002', location: 'Redmond, WA (Hybrid)',       jobType: 'Full-time', salaryRange: { min: 145000, max: 195000, currency: 'USD' }, status: 'Interviewing',     appliedDate: daysAgo(12), priority: 'Medium', tags: ['fullstack','react','dotnet','m365'],                     notes: 'Phone screen done. Technical interview scheduled.'                                         },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Microsoft']._id,  companyName: 'Microsoft',  jobTitle: 'DevOps Engineer — GitHub Actions',             jobDescription: 'Scale and harden the GitHub Actions platform CI/CD infrastructure.',                    jobUrl: 'https://careers.microsoft.com/jobs/github-devops-2003', location: 'Remote',                    jobType: 'Remote',    salaryRange: { min: 155000, max: 200000, currency: 'USD' }, status: 'Applied',          appliedDate: daysAgo(3),  priority: 'Medium', tags: ['devops','cicd','github','remote'],                       notes: 'Applied directly. No response yet.'                                                       },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Amazon']._id,     companyName: 'Amazon',     jobTitle: 'SDE-2 — Amazon Payments',                    jobDescription: 'Own payment processing microservices handling millions of transactions daily.',           jobUrl: 'https://amazon.jobs/sde2-payments-3001',                 location: 'Seattle, WA',               jobType: 'Full-time', salaryRange: { min: 155000, max: 210000, currency: 'USD' }, status: 'Technical Round',  appliedDate: daysAgo(25), priority: 'High',   tags: ['java','aws','payments','microservices','sde2'],          notes: 'Passed LP phone screen. Onsite loop next week.'                                            },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Amazon']._id,     companyName: 'Amazon',     jobTitle: 'Cloud Engineer — AWS Solutions Architecture',  jobDescription: 'Design multi-region AWS architectures for enterprise customers.',                          jobUrl: 'https://amazon.jobs/cloud-eng-aws-3002',                 location: 'New York, NY',              jobType: 'Full-time', salaryRange: { min: 150000, max: 205000, currency: 'USD' }, status: 'Offer',            appliedDate: daysAgo(50), priority: 'High',   tags: ['aws','cloud','solutions-architect'],                     notes: 'Verbal offer received. Written offer expected this week.'                                  },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Amazon']._id,     companyName: 'Amazon',     jobTitle: 'Backend Developer — Amazon Alexa',            jobDescription: 'Build NLU and dialogue management services powering Alexa voice experiences.',          jobUrl: 'https://amazon.jobs/backend-alexa-3003',                 location: 'Bellevue, WA',              jobType: 'Full-time', salaryRange: { min: 140000, max: 190000, currency: 'USD' }, status: 'Rejected',         appliedDate: daysAgo(40), priority: 'Medium', tags: ['backend','nlp','alexa','java'],                          notes: 'Rejected at LP interview stage.'                                                           },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Apple']._id,      companyName: 'Apple',      jobTitle: 'Senior Backend Engineer — Siri Intelligence',  jobDescription: 'Build and scale low-latency inference pipelines for Siri.',                               jobUrl: 'https://jobs.apple.com/siri-backend-4001',               location: 'Cupertino, CA',             jobType: 'Full-time', salaryRange: { min: 185000, max: 250000, currency: 'USD' }, status: 'Interviewing',     appliedDate: daysAgo(9),  priority: 'High',   tags: ['backend','siri','ai','swift','senior'],                  notes: 'Passed initial screen. Technical round with Siri team scheduled.'                          },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Apple']._id,      companyName: 'Apple',      jobTitle: 'Frontend Developer — Apple Maps',              jobDescription: 'Build high-performance MapKit web and native components.',                               jobUrl: 'https://jobs.apple.com/maps-frontend-4002',              location: 'Cupertino, CA',             jobType: 'Full-time', salaryRange: { min: 155000, max: 210000, currency: 'USD' }, status: 'Applied',          appliedDate: daysAgo(6),  priority: 'Medium', tags: ['frontend','maps','javascript','swift'],                  notes: 'Applied via Apple Jobs portal. No response yet.'                                           },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Meta']._id,       companyName: 'Meta',       jobTitle: 'SDE-2 — Instagram Backend Infrastructure',   jobDescription: 'Scale content delivery and feed-ranking systems for Instagram.',                           jobUrl: 'https://metacareers.com/jobs/instagram-be-5001',         location: 'Menlo Park, CA',            jobType: 'Full-time', salaryRange: { min: 170000, max: 235000, currency: 'USD' }, status: 'HR Round',         appliedDate: daysAgo(30), priority: 'High',   tags: ['backend','instagram','python','sde2'],                   notes: 'Cleared 2 technical rounds. HR call pending.'                                              },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Meta']._id,       companyName: 'Meta',       jobTitle: 'ML Engineer — Meta AI Research',              jobDescription: 'Develop LLM training pipelines for Meta AI foundation models.',                           jobUrl: 'https://metacareers.com/jobs/ai-mle-5002',               location: 'New York, NY (Hybrid)',      jobType: 'Full-time', salaryRange: { min: 210000, max: 290000, currency: 'USD' }, status: 'Technical Round',  appliedDate: daysAgo(20), priority: 'High',   tags: ['ml','llm','ai','pytorch','research'],                    notes: 'Coding challenge completed. System design interview scheduled.'                             },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Meta']._id,       companyName: 'Meta',       jobTitle: 'Data Analyst — Growth Analytics',              jobDescription: 'Drive product decisions using experimentation, SQL, and ML-assisted analysis.',          jobUrl: 'https://metacareers.com/jobs/growth-analyst-5003',       location: 'Remote',                    jobType: 'Remote',    salaryRange: { min: 130000, max: 170000, currency: 'USD' }, status: 'Applied',          appliedDate: daysAgo(4),  priority: 'Medium', tags: ['data-analytics','sql','growth','remote'],                notes: 'Applied through LinkedIn. Awaiting response.'                                              },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Netflix']._id,    companyName: 'Netflix',    jobTitle: 'Senior Software Engineer — Streaming Platform', jobDescription: 'Build and optimise adaptive bitrate streaming algorithms and CDN edge logic.',            jobUrl: 'https://jobs.netflix.com/stream-platform-6001',          location: 'Los Gatos, CA',             jobType: 'Full-time', salaryRange: { min: 300000, max: 900000, currency: 'USD' }, status: 'Offer',            appliedDate: daysAgo(55), priority: 'High',   tags: ['backend','streaming','cdn','senior','high-tc'],          notes: 'Offer received — $620K all cash. Comparing with Google offer.'                             },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Netflix']._id,    companyName: 'Netflix',    jobTitle: 'Full Stack Developer — Internal Tools',       jobDescription: 'Build tooling for Netflix content acquisition and operations teams.',                    jobUrl: 'https://jobs.netflix.com/tools-fullstack-6002',          location: 'Los Gatos, CA (Hybrid)',     jobType: 'Full-time', salaryRange: { min: 220000, max: 500000, currency: 'USD' }, status: 'Rejected',         appliedDate: daysAgo(35), priority: 'Medium', tags: ['fullstack','react','java','internal-tools'],             notes: 'Rejected post onsite. Cultural fit cited.'                                                 },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Adobe']._id,      companyName: 'Adobe',      jobTitle: 'MERN Developer — Adobe Experience Manager',  jobDescription: 'Build content management features using MERN stack for AEM SaaS.',                       jobUrl: 'https://adobe.com/careers/aem-mern-7001',                location: 'San Jose, CA (Hybrid)',      jobType: 'Full-time', salaryRange: { min: 135000, max: 175000, currency: 'USD' }, status: 'Interviewing',     appliedDate: daysAgo(11), priority: 'Medium', tags: ['mern','mongodb','react','nodejs','cms'],                 notes: 'Recruiter call complete. Technical assessment submitted.'                                   },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Adobe']._id,      companyName: 'Adobe',      jobTitle: 'AI Engineer — Adobe Firefly',                 jobDescription: 'Build generative AI features for Creative Cloud. Diffusion models, LoRA fine-tuning.',   jobUrl: 'https://adobe.com/careers/firefly-ai-7002',              location: 'San Jose, CA',              jobType: 'Full-time', salaryRange: { min: 165000, max: 220000, currency: 'USD' }, status: 'Applied',          appliedDate: daysAgo(2),  priority: 'High',   tags: ['ai','generative','firefly','diffusion','python'],        notes: 'Just applied. Strong job description match.'                                               },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Oracle']._id,     companyName: 'Oracle',     jobTitle: 'Java Developer — Oracle Financial Services',  jobDescription: 'Develop core banking modules using Java EE and Spring Boot.',                             jobUrl: 'https://oracle.com/careers/java-financial-8001',         location: 'Austin, TX',                jobType: 'Full-time', salaryRange: { min: 120000, max: 160000, currency: 'USD' }, status: 'Applied',          appliedDate: daysAgo(7),  priority: 'Medium', tags: ['java','spring-boot','banking','oracle-db'],              notes: 'Applied through Oracle Careers portal.'                                                    },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Oracle']._id,     companyName: 'Oracle',     jobTitle: 'Cloud Engineer — Oracle Cloud Infrastructure', jobDescription: 'Design and operate OCI Kubernetes clusters and bare-metal compute.',                       jobUrl: 'https://oracle.com/careers/oci-cloud-8002',              location: 'Seattle, WA',               jobType: 'Full-time', salaryRange: { min: 145000, max: 195000, currency: 'USD' }, status: 'Interviewing',     appliedDate: daysAgo(14), priority: 'Medium', tags: ['cloud','kubernetes','oci','infrastructure'],             notes: 'Phone screen completed. Technical round next week.'                                        },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['IBM']._id,        companyName: 'IBM',        jobTitle: 'DevOps Engineer — IBM Cloud',                 jobDescription: 'Manage Tekton pipelines and IBM Cloud Kubernetes deployments.',                            jobUrl: 'https://ibm.com/employment/devops-cloud-9001',           location: 'Remote',                    jobType: 'Remote',    salaryRange: { min: 115000, max: 155000, currency: 'USD' }, status: 'Applied',          appliedDate: daysAgo(5),  priority: 'Low',    tags: ['devops','terraform','kubernetes','ibm-cloud'],           notes: 'Applied via IBM careers site.'                                                             },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Salesforce']._id, companyName: 'Salesforce', jobTitle: 'Senior Backend Engineer — Heroku',            jobDescription: 'Own Heroku platform routing and dyno management infrastructure.',                           jobUrl: 'https://salesforce.com/careers/heroku-backend-10001',    location: 'San Francisco, CA (Hybrid)', jobType: 'Full-time', salaryRange: { min: 160000, max: 215000, currency: 'USD' }, status: 'Technical Round',  appliedDate: daysAgo(17), priority: 'High',   tags: ['backend','heroku','go','platform-engineering','senior'], notes: 'Architecture design round scheduled.'                                                      },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['NVIDIA']._id,     companyName: 'NVIDIA',     jobTitle: 'ML Engineer — CUDA Platform',                 jobDescription: 'Develop GPU-accelerated deep learning primitives in CUDA C++.',                           jobUrl: 'https://nvidia.com/careers/mle-cuda-11001',              location: 'Santa Clara, CA',           jobType: 'Full-time', salaryRange: { min: 200000, max: 300000, currency: 'USD' }, status: 'Interviewing',     appliedDate: daysAgo(16), priority: 'High',   tags: ['ml','cuda','gpu','cpp','deep-learning'],                 notes: 'Recruiter screen done. Technical deep dive scheduled.'                                     },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['NVIDIA']._id,     companyName: 'NVIDIA',     jobTitle: 'Senior Software Engineer — DGX Cloud',        jobDescription: 'Build infrastructure automation for NVIDIA DGX Cloud AI clusters.',                        jobUrl: 'https://nvidia.com/careers/swe-dgx-11002',               location: 'Santa Clara, CA',           jobType: 'Full-time', salaryRange: { min: 190000, max: 260000, currency: 'USD' }, status: 'Applied',          appliedDate: daysAgo(8),  priority: 'High',   tags: ['cloud','infrastructure','python','ai-infra','dgx'],      notes: 'Submitted application. Strong skills match.'                                               },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Cisco']._id,      companyName: 'Cisco',      jobTitle: 'Full Stack Developer — Cisco Webex',          jobDescription: 'Build real-time collaboration features using React, Node.js, and WebRTC.',               jobUrl: 'https://jobs.cisco.com/webex-fullstack-13001',           location: 'San Jose, CA (Hybrid)',      jobType: 'Full-time', salaryRange: { min: 140000, max: 185000, currency: 'USD' }, status: 'HR Round',         appliedDate: daysAgo(27), priority: 'High',   tags: ['fullstack','webrtc','react','nodejs','webex'],           notes: 'All technical rounds cleared. Compensation discussion this week.'                          },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Accenture']._id,  companyName: 'Accenture',  jobTitle: 'Java Developer — Accenture Federal Services', jobDescription: 'Develop Java microservices for US federal government digital transformation.',             jobUrl: 'https://accenture.com/careers/java-federal-14001',       location: 'Washington, DC',            jobType: 'Full-time', salaryRange: { min: 110000, max: 148000, currency: 'USD' }, status: 'Interviewing',     appliedDate: daysAgo(13), priority: 'Medium', tags: ['java','federal','microservices','spring-boot'],          notes: 'US citizenship required. Background check friendly.'                                       },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Deloitte']._id,   companyName: 'Deloitte',   jobTitle: 'SDE-2 — Deloitte Digital (React / Node)',     jobDescription: 'Build modern web applications for Deloitte Digital client projects.',                    jobUrl: 'https://deloitte.com/careers/sde2-digital-15001',        location: 'New York, NY',              jobType: 'Full-time', salaryRange: { min: 120000, max: 155000, currency: 'USD' }, status: 'Technical Round',  appliedDate: daysAgo(19), priority: 'Medium', tags: ['sde2','react','nodejs','consulting','agile'],            notes: 'Case study and coding round completed. Awaiting panel decision.'                            },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Tata Consultancy Services']._id, companyName: 'Tata Consultancy Services', jobTitle: 'MERN Stack Developer — TCS Digital', jobDescription: 'Build digital transformation applications for TCS banking clients using MERN stack.', jobUrl: 'https://ibegin.tcs.com/mern-digital-16001', location: 'New Jersey, NJ', jobType: 'Full-time', salaryRange: { min: 95000, max: 125000, currency: 'USD' }, status: 'Offer', appliedDate: daysAgo(42), priority: 'Medium', tags: ['mern','mongodb','react','banking','digital'], notes: 'Offer letter received. Negotiating base salary.' },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Infosys']._id,    companyName: 'Infosys',    jobTitle: 'Backend Developer — Infosys Cobalt (AWS)',    jobDescription: 'Design cloud-native backend services on AWS for Infosys managed services clients.',       jobUrl: 'https://infosys.com/careers/cobalt-backend-17001',       location: 'Seattle, WA',               jobType: 'Full-time', salaryRange: { min: 105000, max: 138000, currency: 'USD' }, status: 'Interviewing',     appliedDate: daysAgo(15), priority: 'Medium', tags: ['backend','aws','cloud-native','java','cobalt'],          notes: 'Two rounds completed. Final managerial round next week.'                                   },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Cognizant']._id,  companyName: 'Cognizant',  jobTitle: 'Full Stack Developer — Cognizant Digital',    jobDescription: 'Deliver end-to-end web features for banking clients using MEAN stack.',                   jobUrl: 'https://careers.cognizant.com/fullstack-digital-20001',  location: 'Teaneck, NJ',              jobType: 'Full-time', salaryRange: { min: 95000, max: 128000, currency: 'USD' }, status: 'HR Round',         appliedDate: daysAgo(24), priority: 'Medium', tags: ['fullstack','mean-stack','banking','nodejs','angular'],   notes: 'All technical rounds cleared. HR call Thursday.'                                           },
    { _id: new mongoose.Types.ObjectId(), user: userId, company: c['Cognizant']._id,  companyName: 'Cognizant',  jobTitle: 'Cloud Engineer — Cognizant AWS Practice',    jobDescription: 'Migrate on-premise workloads to AWS for healthcare and insurance clients.',              jobUrl: 'https://careers.cognizant.com/cloud-aws-20002',          location: 'Remote',                    jobType: 'Remote',    salaryRange: { min: 110000, max: 145000, currency: 'USD' }, status: 'Applied',          appliedDate: daysAgo(2),  priority: 'Medium', tags: ['cloud','aws','migration','terraform','remote'],          notes: 'Just applied. Good job description alignment.'                                             },
  ];
}

/* ── Interview seed data ─────────────────────────────────────── */

function buildInterviews(userId, jobs) {
  const j = Object.fromEntries(jobs.map((job) => [job.jobTitle, job]));
  return [
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['Senior Software Engineer — Backend']._id,         title: 'Recruiter Introduction Call',                    type: 'Phone Screen',    scheduledDate: dateTimeAgo(16, 14, 0),    duration: 30,  mode: 'Phone',  location: '',                                                           interviewers: [{ name: 'Priya Sharma',           designation: 'Technical Recruiter',          email: 'priya.sharma@google.com'            }],                                                                                                      status: 'Completed',  feedback: 'Very positive call. Priya confirmed L5 track. Moved to technical screen same day.',                                                         rating: 5, preparationNotes: 'Research Google engineering blog. Refresh resume talking points.'                                                                           },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['Senior Software Engineer — Backend']._id,         title: 'Technical Phone Screen — Algorithms',            type: 'Technical',       scheduledDate: dateTimeAgo(12, 11, 0),    duration: 60,  mode: 'Online', location: 'https://meet.google.com/interview-room-goog1',               interviewers: [{ name: 'Karthik Venkatesh',      designation: 'Senior Software Engineer',     email: 'karthik.venkatesh@google.com'       }],                                                                                                      status: 'Completed',  feedback: 'Two LeetCode medium problems. Solved both optimally. Strong positive signal.',                                                                   rating: 4, preparationNotes: 'Practice LeetCode graph and DP problems. Review Big-O notation.'                                                                              },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['Senior Software Engineer — Backend']._id,         title: 'System Design — Distributed Rate Limiter',       type: 'System Design',   scheduledDate: dateTimeFromNow(3, 10, 0), duration: 60,  mode: 'Online', location: 'https://meet.google.com/interview-room-goog2',               interviewers: [{ name: 'Sumanth Rao',            designation: 'Principal Engineer',           email: 'sumanth.rao@google.com'             }, { name: 'Nisha Kapoor', designation: 'Engineering Manager', email: 'nisha.kapoor@google.com' }], status: 'Scheduled',  feedback: '',                                                                                                                                               rating: null, preparationNotes: 'Design distributed rate-limiter: consistent hashing, Redis token bucket, sliding window. Review CAP theorem.'              },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['SDE-2 — Google Cloud Platform']._id,              title: 'Hiring Manager Intro Call',                      type: 'Behavioral',      scheduledDate: dateTimeAgo(42, 15, 30),   duration: 30,  mode: 'Online', location: 'https://meet.google.com/hm-gcp-intro',                       interviewers: [{ name: 'Rajesh Iyer',            designation: 'Engineering Manager — GCP',    email: 'rajesh.iyer@google.com'             }],                                                                                                      status: 'Completed',  feedback: 'Great cultural alignment. Rajesh excited about API developer experience improvements.',                                                          rating: 5, preparationNotes: 'Research GCP developer product roadmap. Prepare questions about team vision.'                                                              },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['SDE-2 — Google Cloud Platform']._id,              title: 'Technical Round 1 — Coding',                     type: 'Coding Challenge', scheduledDate: dateTimeAgo(38, 10, 0),    duration: 60,  mode: 'Online', location: 'https://interview.google.com/session/gcp-r1',                interviewers: [{ name: 'Pallavi Sharma',          designation: 'Software Engineer III',        email: 'pallavi.sharma@google.com'          }],                                                                                                      status: 'Completed',  feedback: 'Two problems: array manipulation and graph BFS. Both solved with optimal solutions.',                                                             rating: 5, preparationNotes: 'Review graph traversal, two-pointer patterns, and sliding window algorithms.'                                                            },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['SDE-2 — Google Cloud Platform']._id,              title: 'Technical Round 2 — System Design',              type: 'System Design',   scheduledDate: dateTimeAgo(35, 14, 0),    duration: 60,  mode: 'Online', location: 'https://interview.google.com/session/gcp-r2',                interviewers: [{ name: 'Vivek Nambiar',          designation: 'Staff Engineer',               email: 'vivek.nambiar@google.com'           }, { name: 'Anita Srivastava', designation: 'Senior Engineer', email: 'anita.srivastava@google.com' }], status: 'Completed', feedback: 'Designed URL shortening with global distribution. Strong hire signal.',                                                                         rating: 4, preparationNotes: 'Study URL shortener, YouTube, and Twitter system design patterns.'                                                                         },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['SDE-2 — Google Cloud Platform']._id,              title: 'Googliness & Leadership Round',                  type: 'HR',              scheduledDate: dateTimeAgo(30, 11, 0),    duration: 45,  mode: 'Online', location: 'https://meet.google.com/leadership-gcp',                     interviewers: [{ name: 'Deepti Malhotra',         designation: 'People Operations Lead',       email: 'deepti.malhotra@google.com'         }],                                                                                                      status: 'Completed',  feedback: 'Excellent soft skills. Offer approved same day.',                                                                                                rating: 5, preparationNotes: 'Prepare STAR examples around cross-functional collaboration and handling ambiguity.'                                                       },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['Senior Software Engineer — Azure Compute']._id,   title: 'Recruiter Phone Screen',                         type: 'Phone Screen',    scheduledDate: dateTimeAgo(20, 9, 0),     duration: 30,  mode: 'Phone',  location: '',                                                           interviewers: [{ name: 'Kavya Nair',             designation: 'Technical Recruiter',          email: 'kavya.nair@microsoft.com'           }],                                                                                                      status: 'Completed',  feedback: 'Confirmed level. Discussed team scope and comp bands. Moved to technical rounds.',                                                                rating: 5, preparationNotes: 'Review Microsoft Azure product suite and recent Azure announcements.'                                                                     },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['Senior Software Engineer — Azure Compute']._id,   title: 'Technical Interview — Azure Infrastructure Design', type: 'System Design', scheduledDate: dateTimeAgo(15, 11, 0),    duration: 90,  mode: 'Online', location: 'https://teams.microsoft.com/interview-azure-sde',            interviewers: [{ name: 'Siddharth Gupta',        designation: 'Principal SDE — Azure',        email: 'siddharth.gupta@microsoft.com'      }, { name: 'Preethi Krishnan', designation: 'Senior SDE', email: 'preethi.krishnan@microsoft.com' }], status: 'Completed', feedback: 'Designed multi-region VM provisioning. Strong on scalability and fault tolerance. Passed.',                                                      rating: 4, preparationNotes: 'Study Azure Kubernetes Service, VM Scale Sets, and Virtual Network architecture.'                                                       },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['Senior Software Engineer — Azure Compute']._id,   title: 'HR Compensation & Offer Discussion',             type: 'HR',              scheduledDate: dateTimeFromNow(2, 14, 0), duration: 45,  mode: 'Phone',  location: '',                                                           interviewers: [{ name: 'Rohan Desai',            designation: 'Talent Acquisition Specialist', email: 'rohan.desai@microsoft.com'         }],                                                                                                      status: 'Scheduled',  feedback: '',                                                                                                                                               rating: null, preparationNotes: 'Research Microsoft L63/L64 salary bands. Know counter-offer range. Review stock vesting schedule.'         },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['SDE-2 — Amazon Payments']._id,                    title: 'Leadership Principles Phone Screen',              type: 'Behavioral',      scheduledDate: dateTimeAgo(23, 10, 30),   duration: 60,  mode: 'Phone',  location: '',                                                           interviewers: [{ name: 'Sneha Kulkarni',          designation: 'Technical Recruiter — AWS',    email: 'sneha.kulkarni@amazon.com'          }],                                                                                                      status: 'Completed',  feedback: 'Covered Customer Obsession and Deliver Results LPs. Stories well-structured.',                                                                   rating: 4, preparationNotes: 'Memorise all 16 Amazon Leadership Principles. Write 2-3 STAR stories for each.'                                                          },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['SDE-2 — Amazon Payments']._id,                    title: 'Online Assessment — Coding',                     type: 'Coding Challenge', scheduledDate: dateTimeAgo(20, 9, 0),     duration: 90,  mode: 'Online', location: 'https://oa.hackerrank.com/amazon-sde2-payments',             interviewers: [],                                                                                                                                               status: 'Completed',  feedback: 'Two coding problems + work simulation. Completed all sections. Score above threshold.',                                                           rating: 4, preparationNotes: 'Practice HackerRank medium/hard. Focus on string manipulation and tree traversal.'                                                       },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['SDE-2 — Amazon Payments']._id,                    title: 'Virtual Onsite Loop — Day 1',                    type: 'Technical',       scheduledDate: dateTimeFromNow(5, 9, 0),  duration: 240, mode: 'Online', location: 'https://chime.aws/amazon-onsite-payments',                   interviewers: [{ name: 'Arjun Balakrishnan',     designation: 'SDE-III — Payments Core',      email: 'arjun.balakrishnan@amazon.com'      }, { name: 'Meenakshi Rajan', designation: 'Principal SDE', email: 'meenakshi.rajan@amazon.com' }, { name: 'Praveen Subramani', designation: 'Bar Raiser', email: 'praveen.subramani@amazon.com' }, { name: 'Sunita Agrawal', designation: 'Engineering Manager', email: 'sunita.agrawal@amazon.com' }], status: 'Scheduled', feedback: '', rating: null, preparationNotes: 'Full day: coding (2x), system design (distributed payment ledger), LP deep-dive with Bar Raiser. Research idempotency keys, at-least-once delivery.' },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['ML Engineer — Meta AI Research']._id,             title: 'Recruiter Screen & Role Briefing',               type: 'Phone Screen',    scheduledDate: dateTimeAgo(18, 15, 0),    duration: 30,  mode: 'Phone',  location: '',                                                           interviewers: [{ name: 'Vikram Patel',           designation: 'Senior Technical Recruiter',   email: 'vikram.patel@meta.com'              }],                                                                                                      status: 'Completed',  feedback: 'Vikram confirmed role is on Llama foundation model team. Strong interest in PyTorch background.',                                                  rating: 5, preparationNotes: 'Read Meta AI blog posts on Llama 2 and 3 architecture.'                                                                                  },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['ML Engineer — Meta AI Research']._id,             title: 'ML System Design — LLM Training Infrastructure', type: 'System Design',   scheduledDate: dateTimeFromNow(6, 13, 0), duration: 90,  mode: 'Online', location: 'https://meet.meta.com/ml-design-interview',                  interviewers: [{ name: 'Harini Subramaniam',     designation: 'Research Engineer — FAIR',     email: 'harini.subramaniam@meta.com'        }, { name: 'Tarun Bajaj', designation: 'Staff Engineer — AI Infra', email: 'tarun.bajaj@meta.com' }], status: 'Scheduled', feedback: '', rating: null, preparationNotes: 'Design distributed LLM training pipeline: FSDP vs DDP, gradient checkpointing, mixed precision. Study PyTorch FSDP internals.'              },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['Senior Software Engineer — Streaming Platform']._id, title: 'Technical Screen — Streaming Algorithms',     type: 'Technical',       scheduledDate: dateTimeAgo(50, 11, 0),    duration: 60,  mode: 'Online', location: 'https://coderpad.io/netflix-screen-stream',                  interviewers: [{ name: 'Gautam Pillai',          designation: 'Senior Engineer — CDN',        email: 'gautam.pillai@netflix.com'          }],                                                                                                      status: 'Completed',  feedback: 'Coding on adaptive bitrate logic simulation in Python with clean abstractions. Strong positive signal.',                                            rating: 5, preparationNotes: 'Study ABR algorithms: BOLA, MPC. Review HLS and MPEG-DASH specs.'                                                                          },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['Senior Software Engineer — Streaming Platform']._id, title: 'System Design — Global CDN Architecture',     type: 'System Design',   scheduledDate: dateTimeAgo(45, 14, 0),    duration: 90,  mode: 'Online', location: 'https://meet.google.com/netflix-sysdesign',                  interviewers: [{ name: 'Ramakrishna Menon',      designation: 'Principal Engineer — Platform', email: 'ramakrishna.menon@netflix.com'     }, { name: 'Shobha Natarajan', designation: 'Engineering Manager', email: 'shobha.natarajan@netflix.com' }], status: 'Completed', feedback: 'Exceptional performance on open cache hierarchy, anycast routing, and real-time telemetry. Immediate strong hire recommendation.',                 rating: 5, preparationNotes: 'Study Netflix Open Connect. Review anycast BGP, consistent hashing for cache placement.'                                                  },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['Senior Backend Engineer — Heroku']._id,            title: 'Technical Screen — Platform Engineering',        type: 'Technical',       scheduledDate: dateTimeAgo(14, 10, 0),    duration: 60,  mode: 'Online', location: 'https://coderpad.io/salesforce-heroku-screen',               interviewers: [{ name: 'Sundar Krishnamurthy',   designation: 'Senior Backend Engineer',      email: 'sundar.krishnamurthy@salesforce.com' }],                                                                                                   status: 'Completed',  feedback: 'Discussed container scheduling and Go concurrency patterns. Live coding on HTTP routing middleware. Passed.',                                        rating: 4, preparationNotes: 'Review Go goroutines and channels. Study Heroku dyno architecture and buildpack system.'                                                    },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['Senior Backend Engineer — Heroku']._id,            title: 'Architecture Deep Dive — Heroku Routing Layer', type: 'System Design',   scheduledDate: dateTimeFromNow(4, 11, 0), duration: 90,  mode: 'Online', location: 'https://salesforce.zoom.us/j/heroku-arch-interview',         interviewers: [{ name: 'Girish Krishnappa',      designation: 'Principal Engineer — Heroku',  email: 'girish.krishnappa@salesforce.com'   }, { name: 'Rekha Padmanabhan', designation: 'Director of Engineering', email: 'rekha.padmanabhan@salesforce.com' }], status: 'Scheduled', feedback: '', rating: null, preparationNotes: 'Design Heroku HTTP routing mesh: load balancing, websocket support, health checks, circuit breaking. Study nginx internals and envoy proxy.' },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['Full Stack Developer — Cisco Webex']._id,          title: 'Technical Screen — React & WebRTC',              type: 'Technical',       scheduledDate: dateTimeAgo(25, 10, 0),    duration: 60,  mode: 'Online', location: 'https://coderpad.io/cisco-webex-screen',                     interviewers: [{ name: 'Balaji Venkatesan',      designation: 'Frontend Engineer — Webex',    email: 'balaji.venkatesan@cisco.com'        }],                                                                                                      status: 'Completed',  feedback: 'Built WebRTC signalling client in React. Clean code and good understanding of SDP/ICE. Strong pass.',                                               rating: 4, preparationNotes: 'Review WebRTC signalling flow, STUN/TURN servers, React performance optimisation.'                                                          },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['Full Stack Developer — Cisco Webex']._id,          title: 'System Design — Real-time Collaboration',        type: 'System Design',   scheduledDate: dateTimeAgo(21, 14, 0),    duration: 75,  mode: 'Online', location: 'https://cisco.webex.com/interview-room-webex',               interviewers: [{ name: 'Vandana Suresh',         designation: 'Staff Engineer — Collaboration', email: 'vandana.suresh@cisco.com'          }, { name: 'Mohan Rajendran', designation: 'Engineering Manager', email: 'mohan.rajendran@cisco.com' }], status: 'Completed', feedback: 'Designed real-time whiteboard with OT. Good coverage of conflict resolution. Minor gaps on CRDT.',                                               rating: 4, preparationNotes: 'Study OT vs CRDT for collaborative editing. Review Socket.IO and WebSocket scaling patterns.'                                              },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['Full Stack Developer — Cisco Webex']._id,          title: 'HR Compensation Call',                           type: 'HR',              scheduledDate: dateTimeAgo(5, 15, 0),     duration: 30,  mode: 'Phone',  location: '',                                                           interviewers: [{ name: 'Lavanya Subramanian',    designation: 'TA Specialist',                email: 'lavanya.subramanian@cisco.com'      }],                                                                                                      status: 'Completed',  feedback: 'Band presented: base $155K, bonus 12%, RSUs over 4 years. Counter-offer sent requesting $165K.',                                                    rating: 3, preparationNotes: 'Research Cisco compensation bands. Prepare counter-offer strategy.'                                                                        },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['MERN Developer — Adobe Experience Manager']._id,  title: 'Initial Recruiter Screen',                       type: 'Phone Screen',    scheduledDate: dateTimeAgo(10, 9, 30),    duration: 30,  mode: 'Phone',  location: '',                                                           interviewers: [{ name: 'Supriya Joshi',          designation: 'Talent Acquisition Lead',      email: 'supriya.joshi@adobe.com'            }],                                                                                                      status: 'Completed',  feedback: 'Quick intro. AEM team works in 2-week sprints. MERN is the primary skill needed.',                                                                rating: 4, preparationNotes: 'Read Adobe AEM documentation and recent blog posts.'                                                                                      },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['MERN Developer — Adobe Experience Manager']._id,  title: 'Take-home Technical Assessment',                 type: 'Coding Challenge', scheduledDate: dateTimeAgo(8, 0, 0),      duration: 180, mode: 'Online', location: '',                                                           interviewers: [],                                                                                                                                               status: 'Cancelled',  feedback: 'Assessment portal had technical issues. Adobe rescheduled to async submission window.',                                                           rating: null, preparationNotes: 'Build a content management CRUD API using Express and MongoDB. Write Jest unit tests.'                                              },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['MERN Stack Developer — TCS Digital']._id,         title: 'TCS Technical Interview — MERN & Java',          type: 'Technical',       scheduledDate: dateTimeAgo(38, 11, 0),    duration: 60,  mode: 'Online', location: 'https://teams.microsoft.com/tcs-digital-interview',          interviewers: [{ name: 'Suresh Narayanan',       designation: 'Talent Acquisition Lead',      email: 'suresh.narayanan@tcs.com'           }, { name: 'Vijay Kulkarni', designation: 'Technical Panel — Digital', email: 'vijay.kulkarni@tcs.com' }], status: 'Completed', feedback: 'Questions on MongoDB aggregation, React hooks, and REST API design. All answered correctly.',                                                      rating: 4, preparationNotes: 'Review MongoDB $lookup and aggregation pipeline. Refresh React useEffect and custom hooks.'                                               },
    { _id: new mongoose.Types.ObjectId(), user: userId, job: j['MERN Stack Developer — TCS Digital']._id,         title: 'Managerial Round & Offer Discussion',            type: 'HR',              scheduledDate: dateTimeAgo(32, 14, 0),    duration: 45,  mode: 'Online', location: 'https://teams.microsoft.com/tcs-managerial-round',           interviewers: [{ name: 'Preeti Saxena',          designation: 'Recruitment Specialist',       email: 'preeti.saxena@tcs.com'              }],                                                                                                      status: 'Completed',  feedback: 'Smooth discussion. Client project is US retail banking modernisation. Offer sent same evening.',                                                     rating: 3, preparationNotes: 'Prepare questions about project type, onsite/offshore ratio, and career growth path.'                                                     },
  ];
}

/* ── Reminder seed data ──────────────────────────────────────── */

/**
 * Builds 20 realistic reminders spanning all four types across the
 * most active job applications. Mix of completed and pending.
 *
 * @param {mongoose.Types.ObjectId} userId
 * @param {object[]} jobs       - inserted Job documents
 * @param {object[]} interviews - inserted Interview documents (reserved for future use)
 * @returns {object[]}
 */
function buildReminders(userId, jobs, _interviews) {
  const j = Object.fromEntries(jobs.map((job) => [job.jobTitle, job]));

  return [
    /* ── Follow-Up reminders ────────────────────────────────── */
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['Senior Software Engineer — Backend']._id,
      title: 'Send thank-you email after System Design round',
      description: 'Email Sumanth Rao and Nisha Kapoor within 24 hours of the system design interview. Reference specific topics discussed to stand out.',
      type: 'Follow-Up',
      dueDate: dateTimeFromNow(4, 10, 0),
      isCompleted: false,
      completedAt: null,
      priority: 'High',
    },
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['Senior Software Engineer — Azure Compute']._id,
      title: 'Follow up with Rohan Desai on HR compensation call',
      description: 'Confirm the call is scheduled for the right time zone. Prepare counter-offer documentation in advance.',
      type: 'Follow-Up',
      dueDate: dateTimeFromNow(1, 9, 0),
      isCompleted: false,
      completedAt: null,
      priority: 'High',
    },
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['SDE-2 — Google Cloud Platform']._id,
      title: 'Send offer acceptance or decline decision to Google',
      description: 'Offer deadline approaching. Compare with Netflix offer details. Send written decision by end of business day.',
      type: 'Follow-Up',
      dueDate: dateTimeFromNow(3, 17, 0),
      isCompleted: false,
      completedAt: null,
      priority: 'High',
    },
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['SDE-2 — Instagram Backend Infrastructure']._id,
      title: 'Follow up with Vikram Patel on HR round schedule',
      description: 'It has been 3 business days since the technical round completed. Send a polite follow-up email asking for an update.',
      type: 'Follow-Up',
      dueDate: dateTimeFromNow(1, 11, 0),
      isCompleted: false,
      completedAt: null,
      priority: 'High',
    },
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['Cloud Engineer — AWS Solutions Architecture']._id,
      title: 'Follow up on written Amazon offer letter',
      description: 'Verbal offer received 2 days ago. Check in with Sneha Kulkarni if written offer has not arrived by EOD.',
      type: 'Follow-Up',
      dueDate: dateTimeFromNow(1, 14, 0),
      isCompleted: false,
      completedAt: null,
      priority: 'High',
    },
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['Backend Developer — Amazon Alexa']._id,
      title: 'Request detailed feedback from Amazon recruiter',
      description: 'Application was rejected. Email Sneha Kulkarni to request specific feedback on the LP interview to improve future responses.',
      type: 'Follow-Up',
      dueDate: daysAgo(30),
      isCompleted: true,
      completedAt: daysAgo(29),
      priority: 'Low',
    },
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['Full Stack Developer — Cisco Webex']._id,
      title: 'Respond to Cisco counter-offer with final decision',
      description: 'Counter-offer sent requesting $165K base. Lavanya expected to respond within 2 business days.',
      type: 'Follow-Up',
      dueDate: dateTimeFromNow(2, 10, 0),
      isCompleted: false,
      completedAt: null,
      priority: 'High',
    },
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['MERN Stack Developer — TCS Digital']._id,
      title: 'Negotiate base salary with TCS before offer expires',
      description: 'Offer letter received. Target $10K increase on base. Call Preeti Saxena with counter. Deadline is end of week.',
      type: 'Follow-Up',
      dueDate: dateTimeFromNow(5, 11, 0),
      isCompleted: false,
      completedAt: null,
      priority: 'Medium',
    },
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['DevOps Engineer — GitHub Actions']._id,
      title: 'Follow up on GitHub Actions application — no response yet',
      description: 'Applied 3 days ago. If no recruiter contact by end of week, apply via a referral channel.',
      type: 'Follow-Up',
      dueDate: dateTimeFromNow(4, 9, 0),
      isCompleted: false,
      completedAt: null,
      priority: 'Low',
    },
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['AI Engineer — Google DeepMind']._id,
      title: 'Sent feedback request email to DeepMind recruiter',
      description: 'Rejection received. Sent email to Priya Sharma asking for specific ML theory feedback to improve for next cycle.',
      type: 'Follow-Up',
      dueDate: daysAgo(55),
      isCompleted: true,
      completedAt: daysAgo(54),
      priority: 'Low',
    },

    /* ── Interview Prep reminders ────────────────────────────── */
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['Senior Software Engineer — Backend']._id,
      title: 'Prepare for Google System Design round — Rate Limiter',
      description: 'Study consistent hashing, Redis token bucket, and sliding window algorithms. Draw architecture diagram in Excalidraw. Mock interview with peer before the real round.',
      type: 'Interview Prep',
      dueDate: dateTimeFromNow(2, 21, 0),
      isCompleted: false,
      completedAt: null,
      priority: 'High',
    },
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['SDE-2 — Amazon Payments']._id,
      title: 'Full-day Amazon onsite prep — all 4 rounds',
      description: 'Day-before prep: review idempotency keys, payment ledger distributed design, Bar Raiser LP stories (Ownership, Deliver Results, Invent and Simplify). Sleep early.',
      type: 'Interview Prep',
      dueDate: dateTimeFromNow(4, 20, 0),
      isCompleted: false,
      completedAt: null,
      priority: 'High',
    },
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['ML Engineer — Meta AI Research']._id,
      title: 'Study FSDP and model parallelism for Meta ML design round',
      description: 'Deep dive: PyTorch FSDP internals, pipeline parallelism vs tensor parallelism, gradient checkpointing, NCCL communication. Run local experiments if possible.',
      type: 'Interview Prep',
      dueDate: dateTimeFromNow(5, 20, 0),
      isCompleted: false,
      completedAt: null,
      priority: 'High',
    },
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['Senior Backend Engineer — Heroku']._id,
      title: 'Prepare Heroku routing layer architecture deep dive',
      description: 'Design the HTTP routing mesh with load balancing, websocket support, header injection, circuit breaking, and health checks. Study envoy proxy and nginx internals.',
      type: 'Interview Prep',
      dueDate: dateTimeFromNow(3, 21, 0),
      isCompleted: false,
      completedAt: null,
      priority: 'High',
    },
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['SDE-2 — Google Cloud Platform']._id,
      title: 'Completed all prep for Google GCP onsite loop',
      description: 'Reviewed URL shortener and YouTube system design. Practiced 10 LeetCode mediums. Mock interviews completed. Ready for loop.',
      type: 'Interview Prep',
      dueDate: daysAgo(37),
      isCompleted: true,
      completedAt: daysAgo(37),
      priority: 'High',
    },

    /* ── Deadline reminders ──────────────────────────────────── */
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['SDE-2 — Google Cloud Platform']._id,
      title: 'Google GCP offer decision deadline',
      description: 'Written offer expires in 5 days. Compare total compensation (base, bonus, equity) with Netflix offer. Make final decision and notify both companies.',
      type: 'Deadline',
      dueDate: dateTimeFromNow(5, 17, 0),
      isCompleted: false,
      completedAt: null,
      priority: 'High',
    },
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['Senior Software Engineer — Streaming Platform']._id,
      title: 'Netflix offer acceptance deadline',
      description: 'Netflix offer ($620K all-cash) expires in 7 days. Decision depends on Google GCP counter and Microsoft Azure HR outcome.',
      type: 'Deadline',
      dueDate: dateTimeFromNow(7, 17, 0),
      isCompleted: false,
      completedAt: null,
      priority: 'High',
    },
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['MERN Stack Developer — TCS Digital']._id,
      title: 'TCS offer acceptance deadline — end of week',
      description: 'TCS offer expires Friday. Salary negotiation must conclude before then. Accept or reject and notify Preeti Saxena.',
      type: 'Deadline',
      dueDate: dateTimeFromNow(4, 17, 0),
      isCompleted: false,
      completedAt: null,
      priority: 'Medium',
    },
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['MERN Developer — Adobe Experience Manager']._id,
      title: 'Submit Adobe AEM take-home assessment (rescheduled)',
      description: 'Adobe rescheduled assessment after portal issue. New window: build a content management CRUD API with Express, MongoDB, and Jest tests. Submit via the portal link.',
      type: 'Deadline',
      dueDate: dateTimeFromNow(3, 23, 59),
      isCompleted: false,
      completedAt: null,
      priority: 'High',
    },

    /* ── Document Submission reminders ──────────────────────── */
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['Java Developer — Accenture Federal Services']._id,
      title: 'Submit background check documents for Accenture Federal',
      description: 'Accenture Federal Services requires background check initiation before onsite. Upload government-issued ID, proof of address, and employment history via the SecureAssist portal link sent by Meera Gopalan.',
      type: 'Document Submission',
      dueDate: dateTimeFromNow(3, 12, 0),
      isCompleted: false,
      completedAt: null,
      priority: 'High',
    },
    {
      _id: new mongoose.Types.ObjectId(), user: userId,
      job: j['Cloud Engineer — AWS Solutions Architecture']._id,
      title: 'Upload AWS certifications to Amazon candidate portal',
      description: 'Amazon recruiter requested AWS Solutions Architect Associate and Professional certificates for the hiring package. Upload via the Amazon Jobs candidate portal before the offer is formalised.',
      type: 'Document Submission',
      dueDate: dateTimeFromNow(2, 12, 0),
      isCompleted: false,
      completedAt: null,
      priority: 'Medium',
    },
  ];
}

/* ── Insert helpers ───────────────────────────────────────────── */

async function insertMany(Model, docs, session) {
  return Model.insertMany(docs, { session, ordered: true });
}

async function clearExistingSeeds(userId, session) {
  await Promise.all([
    Company.deleteMany(  { user: userId }, { session }),
    Job.deleteMany(      { user: userId }, { session }),
    Interview.deleteMany({ user: userId }, { session }),
    Reminder.deleteMany( { user: userId }, { session }),
  ]);
}

/* ── Main exported function ───────────────────────────────────── */

/**
 * Seeds a complete, self-consistent set of demo data for one user.
 * Idempotent — re-running replaces the previous seed.
 * All writes occur inside a single MongoDB transaction; any failure
 * triggers a full rollback.
 *
 * @param {string|mongoose.Types.ObjectId} userId
 * @returns {Promise<{
 *   companies:    object[],
 *   jobs:         object[],
 *   interviews:   object[],
 *   reminders:    object[],
 *   companyMap:   Map<string, object>,
 *   jobMap:       Map<string, object>,
 *   interviewMap: Map<string, object>,
 * }>}
 */
async function seedUser(userId) {
  const userObjectId = userId instanceof mongoose.Types.ObjectId
    ? userId
    : new mongoose.Types.ObjectId(String(userId));

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await clearExistingSeeds(userObjectId, session);

    const companyDocs = buildCompanies(userObjectId);
    const companies   = await insertMany(Company, companyDocs, session);
    const companyMap  = new Map(companies.map((c) => [c.name, c]));

    const jobDocs = buildJobs(userObjectId, companies);
    const jobs    = await insertMany(Job, jobDocs, session);
    const jobMap  = new Map(jobs.map((j) => [j.jobTitle, j]));

    const interviewDocs = buildInterviews(userObjectId, jobs);
    const interviews    = interviewDocs.length
      ? await insertMany(Interview, interviewDocs, session)
      : [];
    const interviewMap  = new Map(interviews.map((i) => [i.title, i]));

    const reminderDocs = buildReminders(userObjectId, jobs, interviews);
    const reminders    = reminderDocs.length
      ? await insertMany(Reminder, reminderDocs, session)
      : [];

    await session.commitTransaction();

    return { companies, jobs, interviews, reminders, companyMap, jobMap, interviewMap };

  } catch (error) {
    await session.abortTransaction();
    throw error;

  } finally {
    session.endSession();
  }
}

module.exports = { seedUser };