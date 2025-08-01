import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChildListPage } from './child-list.page';

describe('ChildListPage', () => {
  let component: ChildListPage;
  let fixture: ComponentFixture<ChildListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
