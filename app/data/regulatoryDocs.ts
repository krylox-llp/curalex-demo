// NAFDAC documents required for product registration.
// Shown on the Product Summary page and on the document upload page.
export type Point = string | { text: string; sub: string[] };
export const REGULATORY_DOCS: { title: string; points?: Point[] }[] = [
  {
    title: "The application letter addressed to the Director-General of NAFDAC",
    points: [
      "Notarized Declaration. To be completed (typed), signed by Declarant and notarized by a Notary Public in Nigeria.",
    ],
  },
  {
    title: "Power of Attorney or Contract Manufacturing Agreement",
    points: [
      {
        text: "The Power of Attorney shall be:",
        sub: [
          "Issued by the manufacturer of the product.",
          "Signed by the Managing Director, General Manager, Chairman or President of the Company, stating the names of the products to be registered.",
        ],
      },
      {
        text: "The Power of Attorney shall also state ‘Authority to register product with NAFDAC’.",
        sub: [
          "State ownership of Brand name(s)/Trademark.",
          "Notarized by a Notary Public in the Country of manufacture.",
          "Valid for at least five (5) years.",
        ],
      },
    ],
  },
  {
    title: "Contract Manufacturer Agreement",
    points: [
      "Notarized by a Notary Public in the country of manufacturer.",
      "Signed by both parties stating names and designations of the signatories with the names of all the products to be registered and other relevant clauses clearly explained in an unambiguous language.",
    ],
  },
  {
    title:
      "Evidence of Business Incorporation of the Applicant with Corporate Affairs Commission in Nigeria",
    points: [
      "Manufacturing License/Certificate of Free Sale Evidence that they are licensed to manufacture drugs for sale in the country of origin (Manufacturer’s Certificate). The license shall be issued by a relevant Health/Regulatory body in the country of manufacture.",
    ],
  },
  {
    title: "Certificate of Pharmaceutical Product (COPP-WHO Format)",
    points: [
      {
        text: "There must be evidence by the competent Health Authority, that the sale of the product does not constitute a contravention of the drug laws of that country. The Certificate of Pharmaceutical Product (COPP) should:",
        sub: [
          "Conform to WHO format.",
          "Be issued by the Health/Regulatory body in the country of manufacture.",
          "Be authenticated by the Nigerian Embassy or High Commission in the country of origin. In countries where no Nigerian Embassy exists, any Commonwealth or ECOWAS country can authenticate the COPP.",
        ],
      },
    ],
  },
  {
    title:
      "Current Good Manufacturing Practice (cGMP) of the manufacturing facility",
    points: [
      {
        text: "This is to be:",
        sub: [
          "Valid at the time of submission.",
          "Issued by the Health/Regulatory body in the country of manufacture.",
          "Authenticated by the Nigerian Embassy or High Commission in the country of origin. In countries where no Nigerian Embassy exists, any Commonwealth or ECOWAS country can authenticate the document.",
        ],
      },
    ],
  },
  {
    title:
      "Evidence of Registration of Brand Name with Trademark Registry in the Ministry of Industry, Trade and Investment",
    points: [
      "This should be registered in the name of the owner of the Trademark/Brand name as the case may be.",
    ],
  },
  {
    title:
      "Copy of valid Annual License to practice for the Superintendent Pharmacist for Human Drugs or Veterinary drugs, issued by the Pharmacists Council of Nigeria (PCN)",
  },
  { title: "Evidence of valid Premises Retention License for the facility" },
  {
    title:
      "Letter of Invitation for Good Manufacturing Practice (GMP) Inspection",
    points: [
      {
        text: "A letter of invitation to inspect the factory abroad shall be written by the manufacturer and shall state the following:",
        sub: [
          "MANUFACTURER INFORMATION: Name of Company, full location address of factory (not administrative office address), e-mail, and current phone no. Details (name, phone number and email) of contact person overseas.",
          "LOCAL AGENT INFORMATION: Name of company, full location address, functional phone no., e-mail address. Details (name, phone number and email) of contact person. Names(s) of product(s) for registration.",
        ],
      },
    ],
  },
];
