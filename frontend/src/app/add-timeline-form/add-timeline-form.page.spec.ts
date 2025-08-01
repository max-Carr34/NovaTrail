import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddTimelineFormPage } from './add-timeline-form.page';

describe('AddTimelineFormPage', () => {
  let component: AddTimelineFormPage;
  let fixture: ComponentFixture<AddTimelineFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTimelineFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
