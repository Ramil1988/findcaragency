import React from "react";
import styled from "styled-components";

const Landing = () => {
  return (
    <Page>
      <Hero>
        <Logo src="/FindCarAgencyLogo.png" alt="FindCarAgency Logo" />
        <Title>Find Car Agency</Title>
        <Tagline>Streamlined vehicle inspections and professional PDF reports.</Tagline>
        <Actions>
          <PrimaryButton as="a" href="#app">Try the App</PrimaryButton>
          <SecondaryLink href="/Car_Inspection_Report_Hyundai Elantra_2014.pdf" target="_blank" rel="noreferrer">
            View Sample Report (PDF)
          </SecondaryLink>
          <SecondaryLink href="https://github.com/Ramil1988/findcaragency" target="_blank" rel="noreferrer">
            View on GitHub
          </SecondaryLink>
        </Actions>
      </Hero>

      <HowItWorks>
        <HowTitle>How It Works</HowTitle>
        <Steps>
          <Step>
            <Badge>1</Badge>
            <span>Enter VIN or vehicle details</span>
          </Step>
          <Step>
            <Badge>2</Badge>
            <span>Complete the Technical Checklist</span>
          </Step>
          <Step>
            <Badge>3</Badge>
            <span>Attach a report (e.g., CARFAX) for parsing</span>
          </Step>
          <Step>
            <Badge>4</Badge>
            <span>Review AI summary and set estimated cost</span>
          </Step>
          <Step>
            <Badge>5</Badge>
            <span>Download the branded PDF report</span>
          </Step>
        </Steps>
      </HowItWorks>

      <Features>
        <FeatureCard>
          <FeatureTitle>VIN Lookup</FeatureTitle>
          <FeatureText>Decode VINs and auto‑fill vehicle details.</FeatureText>
        </FeatureCard>
        <FeatureCard>
          <FeatureTitle>Technical Checklist</FeatureTitle>
          <FeatureText>Fast, guided inspection with clear status markers.</FeatureText>
        </FeatureCard>
        <FeatureCard>
          <FeatureTitle>PDF Export</FeatureTitle>
          <FeatureText>One‑click report generation with your branding.</FeatureText>
        </FeatureCard>
        <FeatureCard>
          <FeatureTitle>Report Parsing</FeatureTitle>
          <FeatureText>Attach a CARFAX/service report; key facts are extracted and summarized.</FeatureText>
        </FeatureCard>
        <FeatureCard>
          <FeatureTitle>AI Summary</FeatureTitle>
          <FeatureText>Concise overview + actionable recommendations based on inspection and report.</FeatureText>
        </FeatureCard>
        <FeatureCard>
          <FeatureTitle>Mobile‑Friendly</FeatureTitle>
          <FeatureText>Responsive UI designed for use on phones and tablets.</FeatureText>
        </FeatureCard>
      </Features>

      <SampleSection>
        <SampleHeader>Sample Report Preview</SampleHeader>
        <SampleNote>
          This preview shows the actual PDF the app generates. Open it in a new tab for full‑screen view.
        </SampleNote>
        <SampleFrame
          data="/Car_Inspection_Report_Hyundai Elantra_2014.pdf"
          type="application/pdf"
          aria-label="Sample generated report"
        >
          <p>
            Your browser can’t display PDFs here. You can
            <a href="/Car_Inspection_Report_Hyundai Elantra_2014.pdf" target="_blank" rel="noreferrer"> open the sample report</a>
            instead.
          </p>
        </SampleFrame>
      </SampleSection>

      <Footer>
        <small>© {new Date().getFullYear()} Find Car Agency</small>
      </Footer>
    </Page>
  );
};

export default Landing;

// Styled Components
const Page = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 60%);
`;

const Hero = styled.section`
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px 24px;
  text-align: center;

  @media (max-width: 600px) {
    padding: 28px 16px 12px;
  }
`;

const Logo = styled.img`
  width: 200px;
  height: auto;
  margin-bottom: 12px;

  @media (max-width: 600px) {
    width: 160px;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  color: #333;
  margin: 8px 0 6px;

  @media (max-width: 600px) {
    font-size: 26px;
  }
`;

const Tagline = styled.p`
  font-size: 16px;
  color: #555;
`;

const Actions = styled.div`
  margin-top: 18px;
  display: inline-flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
`;

const PrimaryButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  border-radius: 24px;
  background: linear-gradient(90deg, #3498db, #8e44ad);
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background: linear-gradient(90deg, #8e44ad, #3498db);
  }
`;

const SecondaryLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border-radius: 24px;
  border: 1px solid #ddd;
  background: #fff;
  color: #333;
  text-decoration: none;

  &:hover {
    background: #f7f7f7;
  }
`;

const Features = styled.section`
  max-width: 1100px;
  margin: 0 auto;
  padding: 10px 20px 30px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.06);
`;

const FeatureTitle = styled.h3`
  margin: 0 0 6px;
  color: #444;
`;

const FeatureText = styled.p`
  margin: 0;
  color: #666;
`;

const HowItWorks = styled.section`
  max-width: 1100px;
  margin: 0 auto 8px;
  padding: 0 20px 8px;
`;

const HowTitle = styled.h3`
  margin: 0 0 10px;
  color: #444;
`;

const Steps = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 14px;
  color: #555;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 14px;
  font-weight: 700;
  color: #34495e;
  background: #fff;
  border: 2px solid #d0d7de;
  border-radius: 6px; /* square with slight rounding */

  @media (max-width: 600px) {
    width: 26px;
    height: 26px;
    font-size: 13px;
  }
`;

const SampleSection = styled.section`
  max-width: 1100px;
  margin: 0 auto 24px;
  padding: 0 20px;
`;

const SampleHeader = styled.h3`
  margin: 10px 0 6px;
  color: #444;
`;

const SampleNote = styled.p`
  margin: 0 0 10px;
  color: #666;
  font-size: 14px;
`;

const SampleFrame = styled.object`
  width: 100%;
  height: 520px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;

  @media (max-width: 600px) {
    height: 380px;
  }
`;

const Footer = styled.footer`
  border-top: 1px solid #eee;
  padding: 16px 20px;
  text-align: center;
  color: #777;
`;
