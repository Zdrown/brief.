"use client";

import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import LocalStorageHelper from "../../../utils/localStorageHelper";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Optional: Configure NProgress to not show spinner and speed up
NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.2 });

// ================ Animations ================
const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const fadeInUp = keyframes`
  0% { opacity: 0; transform: translateY(5px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const loadingBarAnim = keyframes`
  0%   { transform: translateX(-100%); }
  50%  { transform: translateX(30%); }
  100% { transform: translateX(100%); }
`;

// ================ Styled Components ================ //

// Outer container for the entire page
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.backgrounds.secondary};
  color: ${({ theme }) => theme.text.secondary};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
`;

const DateHeading = styled.h1`
  font-size: 2.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.darkBlue};
  margin: 0;
`;

const SubHeading = styled.h2`
  font-size: 1.3rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.darkBlue}; }
  margin: 0.5rem 0 2rem;
`;

// Main header
/*const PageHeader = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.darkBlue};
  }
  text-align: center;
  animation: ${fadeIn} 0.6s ease;
  font familt 
`;*/

// Container for everything below the header
const ResultsContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  margin-top: 1.5rem;
  animation: ${fadeIn} 0.6s ease;
`;

// Central loading container
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 15vh;
  animation: ${fadeIn} 0.6s ease;
`;

// Loading message
const LoadingMessage = styled.div`
  font-size: 1.7rem;
  color: ${({ theme }) => theme.colors.darkBlue};
  margin-bottom: 2rem;
  text-align: center;
`;

// Custom progress bar
const CustomProgressBar = styled.div`
  width: 80%;
  max-width: 400px;
  height: 4px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 40%;
    background: ${({ theme }) => theme.colors.darkBlue};
    animation: ${loadingBarAnim} 2s infinite;
  }
`;

// Each category block
const CategorySection = styled.div`
  margin-bottom: 3rem;
  padding: 2rem;
  background-color: ${({ theme }) => theme.backgrounds.primary};
  border-radius: 8px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
  animation: ${fadeInUp} 0.4s ease both;
`;

// Action buttons container (missing from snippet)
const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  justify-content: flex-end;
  width: 100%;
  max-width: 1000px;
  margin-left: 29vw
`;

// Styled button (missing from snippet)
const ActionButton = styled.button`
  background-color: ${({ theme }) => theme.colors.darkBlue};
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.6rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-family: inherit;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondaryBlue };
  }
`;


// Title of each category
const SectionTitle = styled.h2`
  font-size: 1.6rem;
  color: ${({ theme }) => theme.backgrounds.secondary};
  margin-bottom: 1rem;
  text-transform: capitalize;
  border-bottom: 2px solid ${({ theme }) => theme.colors.darkBlue};
  padding-bottom: 0.5rem;
`;

// Summaries text styling
const Summary = styled.p`
  font-size: 1.2rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.backgrounds.secondary};
  margin-bottom: 1.5rem;
`;

// Optional container for the list of feed items
const FeedItems = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

// Individual feed item styling (cards)
const FeedItem = styled.li`
  margin: 1rem 0;
  padding: 1.2rem;
  background-color: ${({ theme }) => theme.backgrounds.secondary};
  border-radius: 6px;
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  animation: ${fadeInUp} 0.4s ease both;

  &:hover {
    background-color: ${({ theme }) => theme.colors.tan};
  }
  }
`;

// Title of each item
const FeedItemTitle = styled.h3`
  font-size: 1.15rem;
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.darkBlue};
`;

// Feed item content
const FeedItemContent = styled.p`
  font-size: 0.95rem;
  line-height: 1.4;
  margin: 0.3rem 0;
  color: ${({ theme }) => theme.colors.darkBlue};
  opacity: 0.9;
`;

// ================ Main Component ================ //

export default function FetchingPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const [today, setToday] = useState("");


  useEffect(() => {
    const now = new Date();
    const dateString = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setToday(dateString);
  }, []);

  useEffect(() => {
    const fetchSummaries = async () => {
      setLoading(true);
      NProgress.start();

      const preselectedCategories =
        LocalStorageHelper.getItem("preselectedCategories") || [];
      const selfSelectedCategories =
        LocalStorageHelper.getItem("selfSelectedCategories") || [];

      console.log("Preselected Categories:", preselectedCategories);
      console.log("Self-Selected Categories:", selfSelectedCategories);

      // Combine categories, marking them with sourceType
      const allCategories = [
        ...preselectedCategories.map((category) => ({
          title: category,
          sourceType: "reliable",
        })),
        ...selfSelectedCategories.map((category) => ({
          title: category.title,
          sourceType: "self",
        })),
      ];

      console.log("Combined Categories for Fetching:", allCategories);

      try {
        const summaries = await Promise.all(
          allCategories.map(async ({ title, sourceType }) => {
            if (!title || !sourceType) {
              console.warn("Skipping invalid category:", { title, sourceType });
              return {
                category: title || "Unknown",
                summary: "No data available",
                items: [],
              };
            }

            console.log(`Requesting summary for: ${title} (${sourceType})`);

            // Endpoint for your new RSS-based route
            const response = await fetch("/api/newsFetcher", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ category: title, sourceType }),
            });

            console.log(
              `Response for ${title}: Status ${response.status}, OK: ${response.ok}`
            );

            const data = await response.json();
            console.log(`Response Data for ${title}:`, data);

            if (!response.ok) {
              console.error(`Failed to fetch summary for ${title}:`, data.error);
              return {
                category: title,
                summary: "Failed to load summary",
                items: [],
              };
            }

            return {
              category: title,
              summary: data.summary || "No summary available",
              items: data.items || [],
            };
          })
        );

        setResults(summaries);
        console.log("Final Summaries:", summaries);
      } catch (error) {
        console.error("Error fetching summaries:", error);
      } finally {
        NProgress.done();
        setLoading(false);
      }
    };

    fetchSummaries();
  }, []);

  // ================ Render ================ //
  const handleSaveBrief = () => {
    try {
      // Retrieve existing briefs array from localStorage (or empty if not found)
      const existingBriefs = LocalStorageHelper.getItem("dailyBriefs") || [];
  
      // Generate a unique ID (often the current ISO date/time)
      const isoDateString = new Date().toISOString();
  
      // Create an object for the new brief
      const newBrief = {
        id: isoDateString,  // unique ID
        date: isoDateString, 
        data: results       // 'results' is your current daily brief data
      };
  
      // Push this new brief into the array of stored briefs
      existingBriefs.push(newBrief);
  
      // Save the updated array back to localStorage
      LocalStorageHelper.setItem("dailyBriefs", existingBriefs);
  
      alert("Brief saved to local storage!");
    } catch (error) {
      console.error("Failed to save brief:", error);
    }
  };

  const handleShareBrief = () => {
    // Build a shareable text summary
    // For example, we concatenate category + summary
    const shareText = results
      .map(
        (r) =>
          `Category: ${r.category}\nSummary: ${r.summary?.slice(0, 200)}...`
      )
      .join("\n\n");

    if (navigator.share) {
      navigator
        .share({
          title: "Daily Brief",
          text: shareText,
          url: window.location.href, // optional link
        })
        .catch((err) => console.error("Share failed:", err));
    } else {
      // Fallback: simply copy to clipboard or show a message
      navigator.clipboard.writeText(shareText);
      alert("Brief copied to clipboard (Web Share not supported).");
    }
  };


  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingMessage>Building your daily brief...</LoadingMessage>
          <CustomProgressBar />
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <DateHeading>{today}</DateHeading>
      <SubHeading>Your Daily Brief</SubHeading>

           {/* Buttons to Save/Share the entire briefing */}
           <ActionButtonsContainer>
        <ActionButton onClick={handleSaveBrief}>Save Brief</ActionButton>
        <ActionButton onClick={handleShareBrief}>Share Brief</ActionButton>
      </ActionButtonsContainer>


      <ResultsContainer>
        {results.map(({ category, summary, items }) => (
          <CategorySection key={category}>
            <SectionTitle>{category}</SectionTitle>
            <Summary>{summary}</Summary>

            {items && items.length > 0 && (
              <FeedItems>
                {items.map((feedItem) => {
                  const itemKey = feedItem.link || feedItem.title;
                  return (
                    <FeedItem key={itemKey}>
                      <FeedItemTitle>{feedItem.title}</FeedItemTitle>
                      <FeedItemContent>{feedItem.content}</FeedItemContent>
                      {feedItem.link && (
                        <a
                          href={feedItem.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: "0.9rem", color: "#0066cc" }}
                        >
                          Read more
                        </a>
                      )}
                    </FeedItem>
                  );
                })}
              </FeedItems>
            )}
          </CategorySection>
        ))}
      </ResultsContainer>
    </PageContainer>
  );
  }