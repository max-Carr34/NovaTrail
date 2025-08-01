import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChildProfilePage } from './child-profile.page';

describe('ChildProfilePage', () => {
  let component: ChildProfilePage;
  let fixture: ComponentFixture<ChildProfilePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
