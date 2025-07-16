"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, DollarSign } from "lucide-react";

interface Category {
  _id: string;
  name: string;
}

interface FilterState {
  categories: string[];
  priceRanges: string[];
}

interface EventFiltersProps {
  onFiltersChange?: (filters: FilterState) => void;
}

export const EventFilters = function EventFilters({ }: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const priceRanges = [
    { id: "free", label: "Free" },
    { id: "under-50", label: "Under $50" },
    { id: "50-100", label: "$50 - $100" },
    { id: "over-100", label: "Over $100" },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setCategories(data);
          } else {
            console.error('Categories API returned non-array data:', data);
            setCategories([]);
          }
        } else {
          console.error('Failed to fetch categories:', response.status);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Initialize filters from URL params
    const category = searchParams.get('category');
    if (category && category !== 'all') {
      setSelectedCategories([category]);
    }
    
    const priceRange = searchParams.get('price');
    if (priceRange) {
      setSelectedPriceRanges([priceRange]);
    }

    const location = searchParams.get('eventType');
    if (location) {
      setSelectedLocations([location]);
    }
  }, [searchParams]);

  const updateFilters = (newCategories: string[], newPriceRanges: string[], newLocations: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update category filter
    if (newCategories.length > 0) {
      params.set('category', newCategories[0]); // For now, only support single category
    } else {
      params.delete('category');
    }
    
    // Update price filter
    if (newPriceRanges.length > 0) {
      params.set('price', newPriceRanges[0]); // For now, only support single price range
    } else {
      params.delete('price');
    }

    // Update location filter
    if (newLocations.length > 0) {
      params.set('eventType', newLocations[0]); // For now, only support single location
    } else {
      params.delete('eventType');
    }
    
    // Reset to first page when filtering
    params.delete('page');
    
    router.push(`/events?${params.toString()}`);
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    let newCategories: string[];
    if (checked) {
      newCategories = [categoryId]; // Replace current selection
    } else {
      newCategories = selectedCategories.filter(id => id !== categoryId);
    }
    setSelectedCategories(newCategories);
    updateFilters(newCategories, selectedPriceRanges, selectedLocations);
  };

  const handlePriceChange = (priceId: string, checked: boolean) => {
    let newPriceRanges: string[];
    if (checked) {
      newPriceRanges = [priceId]; // Replace current selection
    } else {
      newPriceRanges = selectedPriceRanges.filter(id => id !== priceId);
    }
    setSelectedPriceRanges(newPriceRanges);
    updateFilters(selectedCategories, newPriceRanges, selectedLocations);
  };

  const handleLocationChange = (locationId: string, checked: boolean) => {
    let newLocations: string[];
    if (checked) {
      newLocations = [locationId]; // Replace current selection
    } else {
      newLocations = selectedLocations.filter(id => id !== locationId);
    }
    setSelectedLocations(newLocations);
    updateFilters(selectedCategories, selectedPriceRanges, newLocations);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
    setSelectedLocations([]);
    updateFilters([], [], []);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedPriceRanges.length > 0 || selectedLocations.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Filters
            {hasActiveFilters && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {selectedCategories.length + selectedPriceRanges.length + selectedLocations.length} active
              </span>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-xs h-6 px-2"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories */}
        <div>
          <Label className="text-base font-medium mb-3 flex items-center gap-2">
            Categories
            {selectedCategories.length > 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {selectedCategories.length}
              </span>
            )}
          </Label>
          <div className="space-y-2">
            {loading ? (
              <div className="text-sm text-gray-500">Loading categories...</div>
            ) : Array.isArray(categories) && categories.length > 0 ? (
              categories.map((category) => {
                const isSelected = selectedCategories.includes(category.name.toLowerCase());
                return (
                  <div key={category._id} className={`flex items-center space-x-2 p-1 rounded ${isSelected ? 'bg-blue-50' : ''}`}>
                    <Checkbox
                      id={category._id}
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(
                          category.name.toLowerCase(),
                          checked as boolean
                        )
                      }
                    />
                    <Label 
                      htmlFor={category._id} 
                      className={`text-sm font-normal cursor-pointer ${isSelected ? 'text-blue-700 font-medium' : ''}`}
                    >
                      {category.name}
                    </Label>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-gray-500">No categories available</div>
            )}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-base font-medium mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Price Range
            {selectedPriceRanges.length > 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {selectedPriceRanges.length}
              </span>
            )}
          </Label>
          <div className="space-y-2">
            {priceRanges.map((price) => {
              const isSelected = selectedPriceRanges.includes(price.id);
              return (
                <div key={price.id} className={`flex items-center space-x-2 p-1 rounded ${isSelected ? 'bg-blue-50' : ''}`}>
                  <Checkbox
                    id={price.id}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handlePriceChange(price.id, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={price.id} 
                    className={`text-sm font-normal cursor-pointer ${isSelected ? 'text-blue-700 font-medium' : ''}`}
                  >
                    {price.label}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Type */}
        <div>
          <Label className="text-base font-medium mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Event Type
            {selectedLocations.length > 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {selectedLocations.length}
              </span>
            )}
          </Label>
          <div className="space-y-2">
            {[
              { id: "virtual", label: "Virtual/Online" },
              { id: "in-person", label: "In-Person" }
            ].map((eventType) => {
              const isSelected = selectedLocations.includes(eventType.id);
              return (
                <div key={eventType.id} className={`flex items-center space-x-2 p-1 rounded ${isSelected ? 'bg-blue-50' : ''}`}>
                  <Checkbox 
                    id={eventType.id}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleLocationChange(eventType.id, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={eventType.id} 
                    className={`text-sm font-normal cursor-pointer ${isSelected ? 'text-blue-700 font-medium' : ''}`}
                  >
                    {eventType.label}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
