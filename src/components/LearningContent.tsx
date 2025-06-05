import React, { useState } from 'react';

interface LearningSection {
  title: string;
  content: React.ReactNode;
}

interface LearningContentProps {
  onClose?: () => void;
}

const LearningContent: React.FC<LearningContentProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState(0);
  
  const sections: LearningSection[] = [
    {
      title: "Introduction to Linear Programming",
      content: (
        <div>
          <h3>What is Linear Programming?</h3>
          <p>
            Linear programming is a mathematical optimization technique used to find the best outcome in a mathematical model
            whose requirements are represented by linear relationships.
          </p>
          
          <h3>Key Components</h3>
          <ul>
            <li><strong>Decision Variables:</strong> The values we're trying to determine (e.g., x₁, x₂)</li>
            <li><strong>Objective Function:</strong> The value we're trying to maximize or minimize</li>
            <li><strong>Constraints:</strong> Limitations on the possible values of the decision variables</li>
          </ul>
          
          <div className="mermaid-diagram">
            <img
              src="https://mermaid.ink/img/pako:eNptksFuwjAMhl8l8mknkDptY4LBpGnTDtPOPThNGrfQpEocEKh99yWF0nWcnMTf_-fY8gWUVhY4QnJmDeo0CVtj2Wq025qPB-Gp-BYbNJ8wadpZKtlno5nIWsXZeKLki2h1EyWhVE2YdKYhW46kUop1I8FrUUvpkbAGTXJpDR0Io6xdgpFHVoc263vQ1npp8AT25D2EwOazuk7Pbu-eEP1OqsZaoiH-YRFHFf0u5WpnLI7zjPBFHNWEG3kxabsoSyL8z_HzMtAYCJVH-D3JJBmUd5ViGIVrZZQk5YLt6gG-wEU-Hd01f9R6yJlnbwnIcqOVf3vvSiJKGDW1VHDcmsv-4CvMjf2tgfw4deWVKyq4QVAXnXqS-G4iqONh_-qpEA65rqDxukLv7f07qBm2vbPIUB58Uwmk1-aMY02xAqMgev4C9yCf-w?type=png"
              alt="Linear Programming Components"
            />
          </div>
          
          <h3>Standard Form</h3>
          <p>Linear programs are typically written in standard form:</p>
          <div className="math-display">
            Maximize: c₁x₁ + c₂x₂ + ... + cₙxₙ<br />
            Subject to:<br />
            a₁₁x₁ + a₁₂x₂ + ... + a₁ₙxₙ ≤ b₁<br />
            a₂₁x₁ + a₂₂x₂ + ... + a₂ₙxₙ ≤ b₂<br />
            ...<br />
            aₘ₁x₁ + aₘ₂x₂ + ... + aₘₙxₙ ≤ bₘ<br />
            x₁, x₂, ..., xₙ ≥ 0
          </div>
        </div>
      )
    },
    {
      title: "Understanding the Simplex Algorithm",
      content: (
        <div>
          <h3>Key Insight of Simplex Method</h3>
          <p>
            The simplex algorithm relies on two important properties of linear programs:
          </p>
          <ol>
            <li>The optimal solution (if one exists) occurs at a vertex of the feasible region.</li>
            <li>We can systematically move from vertex to vertex, improving the objective value each time.</li>
          </ol>
          
          <div className="mermaid-diagram">
            <img
              src="https://mermaid.ink/img/pako:eNptksGOgjAQhl-lmb3shfZgZtM1EA-GT-ABT14IDNQmUG3bjbAnffdCwYgR5tJm5vv_TsvMCUrDDMeQnNkWdZqEe2PZwbD9yI8H4an4FC3az5jU9SIVbLVvGclSidl0oeSDOLgkiofSFGHSqoY8cUTxIObNqRMVzdJg177NWB1Yrj2NuscbY5TdJ2jkkdmhyfoeVMu9MngCO_MeQkjzRVX5s9tau4Pkd0LVsibq_sUNMefi8wdvnXeexsY3RXm5_c1YHZcF4ZvYV4QbeXNStouy5MmF_PxxNAZC5RF-T-6SDMqnEoZheKmMkghWbC9b-AL3-TzMdf-o9QjAlw_UkOVGK__xXlU8SmgbueSKxunQnROXNDf2v4byY9eVN5iO4ApB3erUI8d3U0A1DfuXTw2FE9c1NN7W6L19egY1w6Z3Btm8KPmhgvRaXXBqKGZgFESvfwIkrwI?type=png"
              alt="Simplex Method Key Insights"
            />
          </div>
          
          <h3>Step-by-Step Process</h3>
          <ol>
            <li>Convert the problem to standard form and add slack variables</li>
            <li>Set up an initial basic feasible solution (BFS)</li>
            <li>Check for optimality by examining reduced costs</li>
            <li>If not optimal, select an entering variable (pivot column)</li>
            <li>Perform ratio test to determine leaving variable (pivot row)</li>
            <li>Perform pivot operation to move to a new BFS</li>
            <li>Repeat until optimal solution is found</li>
          </ol>
          
          <div className="mermaid-diagram">
            <img
              src="https://mermaid.ink/img/pako:eNpdksFugzAMhl8l8qkn2KGHHTZxoKKqNGk9VOqNA2RpWgph6QpDvPvigYC2ybL9-_-c2BeojGLgCPmFdWjyLDwby84di3f-eRKB8h_Rov2OWdMeUkL6ZRmTZaPEcjaX8lUcXRrFQzEmTJrQiKYjapeIakOUxqa2qLjVrD4X3ogzG9fykyf2zgxvSJcPboEUnWK7hpHsxE7MIXgaW_IOQsj6vW7Ciu3t-gzJc6waa4n6-JtFnF34P6NMdy3Z0hriKOFOCx8VnWj3Cl9htRMm41DDdzDkLT-qM3r_n-bjOG5rIyUJduyoLvANHsrFeDf8VusxVl6CfUKzajSMpfVQEVHKpGukhKLdjaKxUPTVP5gneBBXtbZdRXCDQPRKPUv8NBrY9OxRXroX5rqGJugaQ0r3n6BnOBfHIofy5MdKqO46F5w66iswCpKPPw7hj2k?type=png"
              alt="Simplex Algorithm Flow"
            />
          </div>
          
          <h3>Tableau Representation</h3>
          <p>
            The simplex method uses a tabular format called a "tableau" to perform calculations.
            Each row represents a constraint, and columns represent variables and the right-hand side (RHS).
          </p>
          
          <div className="tableau-example">
            <table>
              <thead>
                <tr>
                  <th>Basic</th>
                  <th>x₁</th>
                  <th>x₂</th>
                  <th>s₁</th>
                  <th>s₂</th>
                  <th>RHS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>z</td>
                  <td>-3</td>
                  <td>-2</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                </tr>
                <tr>
                  <td>s₁</td>
                  <td>2</td>
                  <td>1</td>
                  <td>1</td>
                  <td>0</td>
                  <td>10</td>
                </tr>
                <tr>
                  <td>s₂</td>
                  <td>1</td>
                  <td>2</td>
                  <td>0</td>
                  <td>1</td>
                  <td>8</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      title: "The Pivot Operation",
      content: (
        <div>
          <h3>Understanding the Pivot Operation</h3>
          <p>
            The pivot operation is the core of the simplex method. It's how we move from one basic feasible solution
            to another with a better objective value.
          </p>
          
          <h3>Step 1: Select Entering Variable</h3>
          <p>
            Choose the non-basic variable with the most negative coefficient in the objective row (for maximization).
            This variable will enter the basis.
          </p>
          
          <h3>Step 2: Select Leaving Variable</h3>
          <p>
            Determine which basic variable should leave the basis using the minimum ratio test:
          </p>
          <ul>
            <li>Calculate ratio = RHS / coefficient of entering variable (only for positive coefficients)</li>
            <li>Choose the basic variable with the smallest positive ratio</li>
          </ul>
          
          <div className="mermaid-diagram">
            <img
              src="https://mermaid.ink/img/pako:eNpdksGOgjAQhl-lmb3sRfZgMhs2Qjjs4R18AL3NhmJtoFq2C2FP-u6FgohEOzX95_-mnemcQWlmMcHszPZosizujeXpzd77-XgQgYov0aL9iEmzXaSCfWktE1mjOBsvlXwRR5fG8VBMiJMtGvLkGXCBybTZ0RLPNgUgYz2zRR04sexkbWfp8ANdFyZcE7ukDzikFWGkBmPrnrAGy_JgLV3oSJDD9GFpSz6BzautybsO4rzdQJvU1z24E0dDktXv9cscsWftmvxvwWXeKuy2hiSu8KDFQVUncr6H77B9YXec6ktvx-PxqI2UJLixozrBBd6VKx6v32s9Rs1LMBjQrDc6RlM7pYgoYzK1UsJsf-dmLLJPb-5OvCuuau3hivAOkejVeiXx02lgPbgjeeV-mOsGmmBrDA537xFNM5yLY5FDdfPjJVR3nQtODfU1GA3Z8y-ggpU6?type=png"
              alt="Pivot Operation"
            />
          </div>
          
          <h3>Step 3: Perform Pivot</h3>
          <p>
            Once you've identified the pivot element (the intersection of the entering column and leaving row),
            perform these row operations:
          </p>
          <ol>
            <li>Divide the pivot row by the pivot element to make the pivot element 1</li>
            <li>For each other row, subtract a multiple of the new pivot row to make its entering column value 0</li>
          </ol>
          
          <div className="example-pivot">
            <h4>Example Pivot:</h4>
            <p>Starting tableau with pivot element circled:</p>
            <div className="tableau">
              <table>
                <tbody>
                  <tr>
                    <td>z</td>
                    <td>-3</td>
                    <td>-2</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                  </tr>
                  <tr>
                    <td>s₁</td>
                    <td className="pivot-element">2</td>
                    <td>1</td>
                    <td>1</td>
                    <td>0</td>
                    <td>10</td>
                  </tr>
                  <tr>
                    <td>s₂</td>
                    <td>1</td>
                    <td>2</td>
                    <td>0</td>
                    <td>1</td>
                    <td>8</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p>After pivot:</p>
            <div className="tableau">
              <table>
                <tbody>
                  <tr>
                    <td>z</td>
                    <td>0</td>
                    <td>-0.5</td>
                    <td>1.5</td>
                    <td>0</td>
                    <td>15</td>
                  </tr>
                  <tr>
                    <td>x₁</td>
                    <td>1</td>
                    <td>0.5</td>
                    <td>0.5</td>
                    <td>0</td>
                    <td>5</td>
                  </tr>
                  <tr>
                    <td>s₂</td>
                    <td>0</td>
                    <td>1.5</td>
                    <td>-0.5</td>
                    <td>1</td>
                    <td>3</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="note">
            <p>
              <strong>Note:</strong> Each pivot operation moves us from one vertex of the feasible region to an adjacent vertex
              with a better objective value.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Geometric Interpretation",
      content: (
        <div>
          <h3>Visualizing the Simplex Method</h3>
          <p>
            For problems with two decision variables, we can visualize the simplex method geometrically.
          </p>
          
          <h3>The Feasible Region</h3>
          <p>
            The feasible region is the set of all points that satisfy all constraints. For a 2D problem, it's a polygon.
          </p>
          
          <div className="image-container">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Simplex-method-3-dimensions.png/400px-Simplex-method-3-dimensions.png"
              alt="Feasible Region Example"
            />
            <p className="caption">A feasible region with the simplex method path highlighted</p>
          </div>
          
          <h3>Vertices and Edges</h3>
          <p>
            The simplex method works by moving from vertex to vertex along the edges of the feasible region.
            Each vertex corresponds to a basic feasible solution in the tableau.
          </p>
          
          <h3>Objective Function Contours</h3>
          <p>
            The objective function can be visualized as a family of parallel lines (or planes in higher dimensions).
            The simplex method moves in the direction of improving the objective value.
          </p>
          
          <div className="mermaid-diagram">
            <img
              src="https://mermaid.ink/img/pako:eNptkk9rwzAMxb-KMbvsINnBoYeNHTqWrcfCYLeLD4ntxiS2i-3-Yd9905Ila9bgP5Ze3pOeZMEptVKwBX9mLWaB5yfJ012Yj5fg0P8QLebPmKxiW5ScZfticX-Hz-lRP9hocXtc3CUhrpg_-EXE6Wm_KBf3OO-OUL4J8yHidjwuls_l4o1VoqJ8nmzCJBbCrMoruMxDUZXxJhV5vNmdUA9F_NRHb_7O0v0ulCQf6zAaZ2wwDzwnU0ZS8pZr07IacUat68fEZzAQyk7udQkgJNrohhGYZe7KUPIibmuOWCkLHyiqdcMS0N6j0K5W2HnTEHGprGlqRZZ3mk39OA1GppOVuDNsmANtB2vFYqugbZqPducXmDP2fxdGux7bfmvUel8aQ-vaw1ayolEt0MmvyVvuauj6yuKOtG2xtn39AyODYe-kkHJ1Vjrw97Nn2wo6AqXBfPwBHOOzpA?type=png"
              alt="Objective Function Contours"
            />
          </div>
          
          <h3>Connecting Tableau to Geometry</h3>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Tableau Concept</th>
                <th>Geometric Interpretation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic variables</td>
                <td>Coordinates defining the current vertex</td>
              </tr>
              <tr>
                <td>Non-basic variables</td>
                <td>Variables currently at zero (not contributing)</td>
              </tr>
              <tr>
                <td>Entering variable</td>
                <td>Direction to move from current vertex</td>
              </tr>
              <tr>
                <td>Leaving variable</td>
                <td>Constraint that will become binding</td>
              </tr>
              <tr>
                <td>Pivot operation</td>
                <td>Moving from one vertex to an adjacent one</td>
              </tr>
              <tr>
                <td>Objective row</td>
                <td>Rate of change of objective along edges</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
    {
      title: "Special Cases and Troubleshooting",
      content: (
        <div>
          <h3>Special Cases in Linear Programming</h3>
          
          <div className="case-block">
            <h4>1. Multiple Optimal Solutions</h4>
            <p>
              Occurs when a non-basic variable has a zero coefficient in the objective row at optimality.
              This means there's an edge of the feasible region where the objective value is constant.
            </p>
            <div className="mermaid-diagram">
              <img
                src="https://mermaid.ink/img/pako:eNptksFugzAMhl8l8qnSAN1hh-3SHaZN0ibtsgOHQAxEJGTKASHefXECVLTNlvzb3_87tnGByhgLGeRn0aHJ82QH4OxcyIP_PUlP5VE0AJ-Qm7qtSC19bSy1jVbTYablQbZmEiVDaZow6UIjmmZcjls0T3LR4HJQcw4lGNFydgLr5MUYbY_JvgctO4BDyBZnW1BKbSrqYLZ7MFyCcO3ibVFcQJPfat92Gt8av2G3jFnWyD1aV0fyXcrl7gNG-UjVO4vRSjVuGd5RmhY3sxK47YSj18baMy6E0SHO66lZm8bZudEs7Tu0YQmlbNQTtOhTJDBQyuerw_vEcErJsogvNgPNgUgHRN-TvyTi8r3SKozSrTZaUbJgx8bCB7zL594v_KLW47CM3fvf0GZ76-Lb-6joqQRaRePhYAjySV2IPrSInZr_TVB-mgb7boImHCsAzZ3nkdJvMxTCLe3b4P-YjK-gi6ZC5-3za1BTbHsbUBx9M1RcXptzwTr6NTgD-esPXl6h9w?type=png"
                alt="Multiple Optimal Solutions"
              />
            </div>
          </div>
          
          <div className="case-block">
            <h4>2. Unbounded Problem</h4>
            <p>
              Occurs when a non-basic variable has a negative coefficient in the objective row (for maximization),
              but all constraints have non-positive coefficients for that variable. The objective can increase indefinitely.
            </p>
            <p>
              <strong>Detection:</strong> During ratio test, if all coefficients in the entering column are ≤ 0,
              the problem is unbounded.
            </p>
            <div className="mermaid-diagram">
              <img
                src="https://mermaid.ink/img/pako:eNptksFugzAMhl8l8mmn0h12QO3SHTatoE3abQcOgRiIlpB1HBDi3RcnMEFbbcmf_f2_Y8sXKLWyEEM8sTXqOAq2SrONVpud-xyEE_FD1Kr-xKhuZ-7QyKdGUVspNp7MVLyKpZ5F0VBMCJPOa8TrPlnohDdT9Fm3NdZK9X-U0rDm_DL7Hj-L88ZoiJe55xrq-BV79DV2cqQTuJAstK16pfMemU1-20AtNvExjdjDqhRTrJQ7mJPWm0g-Uxp3FxjkAyVvDXrF6jDl9Ile10SsVlpZW-KMa-XjfF6a1XFo7ZVmbdej8UugZS2eYIUuhQNT1Hy6RbxPDYeYzEngthNg3hOJgOh7spfEXLxXShpG6Vppaij6YCc-H9_gXTwd_cQLWvcpGTv3v6FJtzWFt_eh0UmE2oVOZlvoeIgbYoQtJmdl_4vg8Jz69d30jTjUoDr3OXL6taZCuLn9GvwXk_AVrEVVonX2-QXUGNvOBjI-sk0lxKU5E6KjXILSED__AmrInpM?type=png"
                alt="Unbounded Problem"
              />
            </div>
          </div>
          
          <div className="case-block">
            <h4>3. Infeasible Problem</h4>
            <p>
              Occurs when there's no solution that satisfies all constraints. The feasible region is empty.
            </p>
            <p>
              <strong>Detection:</strong> When using Phase I of the simplex method, if artificial variables
              remain in the basis with positive values, the problem is infeasible.
            </p>
          </div>
          
          <div className="case-block">
            <h4>4. Degeneracy</h4>
            <p>
              Occurs when a basic variable has a value of zero. This can cause cycling in the simplex algorithm.
            </p>
            <p>
              <strong>Symptoms:</strong> Multiple minimum ratios during the ratio test, or iterations that don't
              improve the objective value.
            </p>
            <p>
              <strong>Solution:</strong> Use anti-cycling techniques like Bland's rule (choose the lowest-indexed variable
              when there are ties).
            </p>
          </div>
          
          <h3>Troubleshooting Tips</h3>
          <ul>
            <li>Always double-check your tableau operations for arithmetic errors</li>
            <li>Make sure you've correctly converted the problem to standard form</li>
            <li>Verify that all variables are non-negative</li>
            <li>If the problem is infeasible, check your constraints for errors</li>
            <li>If getting unexpected results, try graphing the problem (for 2D problems)</li>
          </ul>
        </div>
      )
    }
  ];
  
  return (
    <div className="learning-content">
      <div className="learning-header">
        <h2>Linear Programming: Learning Materials</h2>
        {onClose && (
          <button onClick={onClose} className="close-button">
            Close
          </button>
        )}
      </div>
      
      <div className="learning-navigation">
        {sections.map((section, index) => (
          <button
            key={index}
            className={`nav-button ${activeSection === index ? 'active' : ''}`}
            onClick={() => setActiveSection(index)}
          >
            {section.title}
          </button>
        ))}
      </div>
      
      <div className="section-content">
        {sections[activeSection].content}
      </div>
      
      <div className="navigation-arrows">
        {activeSection > 0 && (
          <button 
            className="arrow-button prev"
            onClick={() => setActiveSection(activeSection - 1)}
          >
            ← Previous: {sections[activeSection - 1].title}
          </button>
        )}
        
        {activeSection < sections.length - 1 && (
          <button 
            className="arrow-button next"
            onClick={() => setActiveSection(activeSection + 1)}
          >
            Next: {sections[activeSection + 1].title} →
          </button>
        )}
      </div>
      
      <style jsx>{`
        .learning-content {
          padding: 20px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 900px;
          margin: 0 auto;
        }
        
        .learning-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .close-button {
          background-color: #f44336;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .learning-navigation {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .nav-button {
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f9f9f9;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .nav-button.active {
          background-color: #1976d2;
          color: white;
          border-color: #1976d2;
        }
        
        .section-content {
          padding: 20px;
          border: 1px solid #eee;
          border-radius: 4px;
          min-height: 400px;
          margin-bottom: 20px;
        }
        
        .section-content h3 {
          margin-top: 0;
          color: #333;
        }
        
        .section-content p, .section-content li {
          line-height: 1.5;
        }
        
        .navigation-arrows {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }
        
        .arrow-button {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          background-color: #e3f2fd;
          color: #1976d2;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .arrow-button:hover {
          background-color: #bbdefb;
        }
        
        .arrow-button.next {
          margin-left: auto;
        }
        
        .mermaid-diagram {
          margin: 20px 0;
          text-align: center;
        }
        
        .mermaid-diagram img {
          max-width: 100%;
          border: 1px solid #eee;
          border-radius: 4px;
        }
        
        .math-display {
          font-family: monospace;
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
          margin: 15px 0;
          line-height: 1.5;
        }
        
        .tableau-example table {
          border-collapse: collapse;
          width: 100%;
          margin: 15px 0;
        }
        
        .tableau-example th, .tableau-example td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
        }
        
        .tableau-example th {
          background-color: #f5f5f5;
        }
        
        .example-pivot {
          margin: 20px 0;
          padding: 15px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }
        
        .pivot-element {
          background-color: #ffcb6b;
          font-weight: bold;
          border-radius: 50%;
        }
        
        .case-block {
          margin-bottom: 20px;
          padding: 15px;
          border-left: 4px solid #1976d2;
          background-color: #f5f5f5;
        }
        
        .case-block h4 {
          margin-top: 0;
          color: #1976d2;
        }
        
        .image-container {
          text-align: center;
          margin: 20px 0;
        }
        
        .image-container img {
          max-width: 100%;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .caption {
          font-style: italic;
          color: #666;
          margin-top: 8px;
        }
        
        .compare-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        .compare-table th, .compare-table td {
          padding: 10px;
          border: 1px solid #ddd;
        }
        
        .compare-table th {
          background-color: #f5f5f5;
        }
        
        .note {
          margin-top: 20px;
          padding: 15px;
          background-color: #fff8e1;
          border-left: 4px solid #ffc107;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default LearningContent;