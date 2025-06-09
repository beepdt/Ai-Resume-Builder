"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Trash2, Briefcase, AlertCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Experience } from "@/lib/supabase";
import React, { useState } from "react";
import { Label } from "@radix-ui/react-label";

type Props = {
  form: Partial<Experience>;
  setForm: (form: Partial<Experience>) => void;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  editingId: string | null;
  onSubmit: () => void;
  onEdit: (exp: Experience) => void;
  onRemove: (id: string) => void;
  experiences: Experience[];
};

export const ExperienceSection : React.FC<Props>=({
    form,
  setForm,
  showForm,
  setShowForm,
  editingId,
  onSubmit,
  onEdit,
  onRemove,
  experiences,
}) => {
  const handleSubmit = () => {
    if (form.company && form.position) {
      const newExperience: Experience = {
        id: editingId || Date.now().toString(),
        company: form.company,
        position: form.position,
        start_date: form.start_date || "",
        end_date: form.end_date || "",
        description: Array.isArray(form.description)
          ? form.description
          : form.description
          ? [form.description as string]
          : [],
        location: form.location || "",
        current: form.current || false,
      };

      onSubmit();
    }
  };

  const editExperience = (exp: Experience) => {
    setForm(exp);
    onEdit(exp);
    setShowForm(true);
  };

  const removeExperience = (id: string) => {
    onRemove(id);
  }

  return (
      <div className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-lg p-6 space-y-6">
      {/* Form UI */}
      {showForm && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit' : 'Add'} Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Company"
                  value={form.company || ''}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  placeholder="Position"
                  value={form.position || ''}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Location"
                value={form.location || ''}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={form.start_date || ''}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={form.end_date || ''}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  disabled={form.current}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="current"
                checked={form.current || false}
                onCheckedChange={(checked) => setForm({ ...form, current: checked === true })}
              />
              <Label htmlFor="current">Current Position</Label>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Job description and responsibilities"
                value={Array.isArray(form.description) ? form.description.join('\n') : form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value.split('\n') })}
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit}>
                {editingId ? 'Update' : 'Add'} Experience
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Experience List */}
      <div className="space-y-4">
        {experiences.map((exp) => (
          <Card key={exp.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{exp.position}</h3>
                  <p className="text-muted-foreground">{exp.company}</p>
                  {exp.location && <p className="text-sm text-muted-foreground">{exp.location}</p>}
                  <p className="text-sm text-muted-foreground">
                    {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => editExperience(exp)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => removeExperience(exp.id)}>
                    Remove
                  </Button>
                </div>
              </div>
              {exp.description.length > 0 && (
                <div className="space-y-1">
                  {exp.description.map((desc, i) => (
                    <p key={i} className="text-sm">{desc}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="w-full">
          Add Experience
        </Button>
      )}
    </div>
  )
};
