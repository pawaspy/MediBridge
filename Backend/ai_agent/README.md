# Aliza AI Agent

Aliza is an AI assistant integrated into the MediBridge platform that helps users with medical queries. It provides two main capabilities:

1. Recommending medicines based on user-described conditions/allergies
2. Finding doctors by specialization

## Usage

The Aliza AI agent can be accessed through the MediBridge API:

```
POST /api/aliza/query
```

### Request Format

```json
{
  "query": "What medicine can help with headache?"
}
```

The query is a natural language question or statement about a medical condition or a request to find a doctor.

### Response Format

```json
{
  "message": "Based on your condition (headache), here are some recommended medicines:",
  "data": [
    {
      "id": 5,
      "name": "Paracetamol",
      "description": "Pain reliever for headaches and mild pain",
      "price": "5.99",
      "expiry_date": "2023-12-31",
      "seller": "pharmacy_one"
    },
    // More medicines...
  ],
  "type": "medicine_list",
  "followup": "Would you like more information about any of these medicines, or would you prefer to speak with a doctor?"
}
```

## Types of Queries

### Medicine Recommendations

Aliza can understand queries like:
- "What medicine can help with a headache?"
- "I have a sore throat"
- "Treatment for fever"
- "Medicine for cough with allergy to penicillin"

### Doctor Recommendations

Aliza can understand queries like:
- "Find a doctor for heart problems"
- "Cardiologist near me"
- "I need a skin specialist"
- "Doctors who treat diabetes"

## Implementation Details

Aliza uses natural language processing with regex patterns to detect user intent from queries. For medicine recommendations, it searches the database using condition keywords and filters results based on allergies. For doctor recommendations, it searches for specialists and returns the top 5 matches.

The AI agent includes standardization of medical conditions and specialties to improve search accuracy and provides structured responses with follow-up suggestions to enhance the conversational experience.

## Integration

Aliza is fully integrated into the MediBridge platform and works with the existing database schema, using the appropriate query methods like `SearchMedicinesByNameSortedByPrice` and `ListDoctorsBySpecialization`. 